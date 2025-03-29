import { useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { WriteContractErrorType, WriteContractReturnType } from "wagmi/actions";
import { MutateOptions } from "@tanstack/react-query";
import { WriteContractVariables } from "wagmi/query";
import { Config } from "wagmi";
import { Hash } from "viem";
import { useWriteContract } from "wagmi";
import { useDiamondWithFacets, getFunctionAbiByName } from "../contracts/useDiamondContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";

/**
 * Hook for writing to Diamond contract with type safety
 * @returns Object containing write function, loading state, and error
 */
export const useDiamondWrite = <TArgs extends any[] = any[]>(
  functionName?: string,
  options?: {
    onSuccess?: (txHash: Hash) => void;
    onError?: (error: Error) => void;
    blockConfirmations?: number;
    onBlockConfirmation?: (txnReceipt: { blockHash: string }) => void;
  }
) => {
  const { combinedAbi, diamondAddress, isLoading: abiLoading } = useDiamondWithFacets();
  const { targetNetwork } = useTargetNetwork();
  const { chain: accountChain } = useAccount();
  const [isMining, setIsMining] = useState(false);
  const writeTx = useTransactor();

  // Get ABI function definition if function name is provided
  const abiFunction = functionName && combinedAbi 
    ? getFunctionAbiByName(functionName, combinedAbi) 
    : null;

  // Prepare the ABI for useWriteContract - it expects an array of ABI definitions
  const abiFunctionArray = abiFunction ? [abiFunction as AbiFunction] : undefined;

  // Use wagmi's useWriteContract hook
  const wagmiContractWrite = useWriteContract();

  /**
   * Execute contract write operation
   * @param args Function arguments
   * @param overrides Additional options or overrides
   * @returns Transaction result or error
   */
  const write = async (
    args: TArgs = [] as unknown as TArgs,
    overrides: {
      functionName?: string;
      onSuccess?: (txHash: Hash) => void;
      onError?: (error: Error) => void;
      gasLimit?: bigint;
    } = {}
  ) => {
    // Determine which function name to use
    const finalFunctionName = overrides.functionName || functionName;
    
    if (!finalFunctionName) {
      const error = new Error("Function name is required");
      overrides.onError?.(error);
      options?.onError?.(error);
      return { error };
    }

    // If function name changed, get the new ABI function
    const finalAbiFunction = finalFunctionName !== functionName && combinedAbi
      ? getFunctionAbiByName(finalFunctionName, combinedAbi)
      : abiFunction;

    if (!combinedAbi || !diamondAddress || abiLoading) {
      const error = new Error("Contract data not available");
      overrides.onError?.(error);
      options?.onError?.(error);
      return { error };
    }

    if (!finalAbiFunction) {
      const error = new Error(`Method ${finalFunctionName} not found in ABI`);
      overrides.onError?.(error);
      options?.onError?.(error);
      return { error };
    }

    if (!accountChain?.id) {
      notification.error("Please connect your wallet");
      const error = new Error("Wallet not connected");
      overrides.onError?.(error);
      options?.onError?.(error);
      return { error };
    }

    if (accountChain?.id !== targetNetwork.id) {
      notification.error(`Wallet is connected to the wrong network. Please switch to ${targetNetwork.name}`);
      const error = new Error("Wrong network");
      overrides.onError?.(error);
      options?.onError?.(error);
      return { error };
    }

    try {
      setIsMining(true);
      const { blockConfirmations, onBlockConfirmation } = options || {};
      
      // Prepare writeContract function
      const makeWriteWithParams = () => wagmiContractWrite.writeContractAsync({
        address: diamondAddress,
        abi: [finalAbiFunction] as Abi,
        functionName: finalFunctionName,
        args,
        gas: overrides.gasLimit,
      });

      // Use the transactor to handle the transaction
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      // Call success callbacks
      const onSuccessCallback = overrides.onSuccess || options?.onSuccess;
      if (onSuccessCallback && writeTxResult) {
        onSuccessCallback(writeTxResult);
      }

      return writeTxResult;
    } catch (error) {
      const errorHandler = overrides.onError || options?.onError;
      if (errorHandler) {
        errorHandler(error as Error);
      }
      return { error: error as Error };
    } finally {
      setIsMining(false);
    }
  };

  return {
    write,
    writeAsync: write, // Alias for compatibility
    isLoading: abiLoading || wagmiContractWrite.isPending,
    isMining,
    error: wagmiContractWrite.error as WriteContractErrorType | null,
    reset: wagmiContractWrite.reset,
    status: wagmiContractWrite.status,
    data: wagmiContractWrite.data,
  };
};