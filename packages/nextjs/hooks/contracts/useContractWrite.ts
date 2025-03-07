import { useCallback } from "react";
import { Abi, Address } from "abitype";
import { useWalletClient } from "wagmi";
import { usePublicClient } from "wagmi";
import { useFacetsAbi, getFunctionAbiByName } from "./useDiamondContract";

/**
 * 用于写入Diamond合约数据的钩子
 */
export const useContractWrite = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { combinedAbi, diamondAddress, isLoading } = useFacetsAbi();

  /**
   * 写入合约方法
   * @param methodName 方法名称
   * @param args 方法参数
   * @param options 可选配置
   */
  const writeMethod = useCallback(
    async (
      methodName: string,
      args: any[] = [],
      options?: {
        onSuccess?: (txHash: `0x${string}`) => void;
        onError?: (error: Error) => void;
        gasLimit?: bigint;
      }
    ) => {
      if (!combinedAbi || !diamondAddress || isLoading || !walletClient || !publicClient) {
        const error = new Error("Contract data or wallet not available");
        options?.onError?.(error);
        return { error };
      }

      const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
      if (!abiFunction) {
        const error = new Error(`Method ${methodName} not found in ABI`);
        options?.onError?.(error);
        return { error };
      }

      try {
        // 估算gas费用
        let gasLimit = options?.gasLimit;
        if (!gasLimit) {
          try {
            const estimatedGas = await publicClient.estimateContractGas({
              address: diamondAddress,
              abi: combinedAbi,
              functionName: methodName,
              args,
              account: walletClient.account,
            });
            // 添加20%的缓冲
            gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);
          } catch (error) {
            console.warn(`Gas estimation failed for ${methodName}:`, error);
            // 如果估算失败，不设置gasLimit，让钱包自行处理
          }
        }

        // 执行合约写入
        const hash = await walletClient.writeContract({
          address: diamondAddress,
          abi: combinedAbi,
          functionName: methodName,
          args,
          gas: gasLimit,
        });

        options?.onSuccess?.(hash);
        return { hash };
      } catch (error) {
        console.error(`Error writing contract method ${methodName}:`, error);
        options?.onError?.(error as Error);
        return { error };
      }
    },
    [combinedAbi, diamondAddress, isLoading, walletClient, publicClient]
  );

  return {
    writeMethod,
    isLoading,
    diamondAddress,
    combinedAbi,
  };
}; 