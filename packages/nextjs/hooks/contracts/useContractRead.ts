import { useCallback } from "react";
import { Abi, AbiFunction, Address } from "abitype";
import { usePublicClient } from "wagmi";
import { useFacetsAbi, getFunctionAbiByName } from "./useDiamondContract";

// 创建一个简单的结果缓存
const resultCache: Record<string, { data: any; timestamp: number }> = {};
// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 30000; // 30秒

/**
 * 用于读取Diamond合约数据的钩子
 */
export const useContractRead = () => {
  const publicClient = usePublicClient();
  const { combinedAbi, diamondAddress, isLoading } = useFacetsAbi();

  /**
   * 生成缓存键
   */
  const getCacheKey = (methodName: string, args: any[] = []) => {
    return `${methodName}:${JSON.stringify(args)}`;
  };

  /**
   * 读取合约方法
   * @param methodName 方法名称
   * @param args 方法参数
   * @param options 可选配置
   */
  const readMethod = useCallback(
    async (
      methodName: string, 
      args: any[] = [], 
      options?: { 
        skipCache?: boolean;
      }
    ) => {
      const { skipCache = false } = options || {};
      
      if (!combinedAbi || !diamondAddress || !publicClient) {
        console.error("Contract data or public client not available");
        return null;
      }

      const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
      if (!abiFunction) {
        console.error(`Method ${methodName} not found in ABI`);
        return null;
      }

      // 检查缓存
      const cacheKey = getCacheKey(methodName, args);
      const cachedResult = resultCache[cacheKey];
      
      if (!skipCache && cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
        return cachedResult.data;
      }

      try {
        const result = await publicClient.readContract({
          address: diamondAddress,
          abi: combinedAbi,
          functionName: methodName,
          args,
        });

        // 更新缓存
        resultCache[cacheKey] = {
          data: result,
          timestamp: Date.now(),
        };
        
        return result;
      } catch (error) {
        console.error(`Error reading contract method ${methodName}:`, error);
        return null;
      }
    },
    [combinedAbi, diamondAddress, publicClient]
  );

  /**
   * 批量读取合约方法
   * @param calls 方法调用数组，每个元素包含方法名和参数
   * @param options 可选配置
   */
  const batchRead = useCallback(
    async (
      calls: { method: string; args?: any[] }[],
      options?: { 
        skipCache?: boolean;
      }
    ) => {
      if (!combinedAbi || !diamondAddress || !publicClient) {
        console.error("Contract data or public client not available");
        return [];
      }

      try {
        const results = await Promise.all(
          calls.map(({ method, args = [] }) => readMethod(method, args, options))
        );

        return results;
      } catch (error) {
        console.error("Error in batch read:", error);
        return [];
      }
    },
    [combinedAbi, diamondAddress, publicClient, readMethod]
  );

  /**
   * 清除特定方法的缓存
   * @param methodName 方法名称
   * @param args 方法参数
   */
  const clearCache = useCallback((methodName?: string, args?: any[]) => {
    if (methodName) {
      const cacheKey = getCacheKey(methodName, args);
      delete resultCache[cacheKey];
    } else {
      // 清除所有缓存
      Object.keys(resultCache).forEach(key => {
        delete resultCache[key];
      });
    }
  }, []);

  return {
    readMethod,
    batchRead,
    clearCache,
    isLoading,
    diamondAddress,
    combinedAbi,
  };
}; 