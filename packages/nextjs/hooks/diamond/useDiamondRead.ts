import { useEffect, useState } from "react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Abi, AbiFunction } from "abitype";
import { BlockTag, ReadContractErrorType } from "viem";
import { useReadContract } from "wagmi";
import { useDiamondWithFacets, getFunctionAbiByName } from "./useDiamondContract";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Hook for reading from Diamond contract with type safety
 * @param functionName The name of the contract function to call
 * @param args The arguments to pass to the function
 * @param options Optional configuration
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useDiamondRead = <TData = any>(
  functionName: string,
  args: any[] = [],
  options?: {
    blockTag?: BlockTag;
    enabled?: boolean;
    watch?: boolean;
  }
) => {
  const { combinedAbi, diamondAddress, isLoading: abiLoading } = useDiamondWithFacets();
  const { targetNetwork } = useTargetNetwork();
  const queryClient = useQueryClient();
  
  // Get ABI function definition
  const abiFunction = combinedAbi ? getFunctionAbiByName(functionName, combinedAbi) : null;

  // Prepare the ABI for useReadContract - it expects an array of ABI definitions
  const abiFunctionArray = abiFunction ? [abiFunction as AbiFunction] : undefined;
  
  // Determine if the query should be enabled
  const isEnabled = 
    Boolean(combinedAbi && diamondAddress && !abiLoading && abiFunction && options?.enabled !== false) &&
    (!Array.isArray(args) || !args.some(arg => arg === undefined));
  
  // Set watch to true by default
  const defaultWatch = options?.watch ?? true;
  
  // Use wagmi's useReadContract hook
  const readContractHookRes = useReadContract({
    chainId: targetNetwork.id,
    functionName,
    address: diamondAddress,
    abi: abiFunctionArray as Abi | undefined,
    args,
    blockTag: options?.blockTag,
    query: {
      enabled: isEnabled,
    },
  });

  // Listen for new blocks and invalidate queries when needed
  const { data: blockNumber } = useBlockNumber({
    watch: defaultWatch,
    chainId: targetNetwork.id,
    query: {
      enabled: defaultWatch,
    },
  });

  // Invalidate the query when the block number changes
  useEffect(() => {
    if (defaultWatch && readContractHookRes.queryKey) {
      queryClient.invalidateQueries({ queryKey: readContractHookRes.queryKey });
    }
  }, [blockNumber, defaultWatch, queryClient, readContractHookRes.queryKey]);

  // Cast the response to include our generic type
  return {
    data: readContractHookRes.data as TData,
    isLoading: abiLoading || readContractHookRes.isLoading,
    error: readContractHookRes.error,
    refetch: readContractHookRes.refetch as (
      options?: RefetchOptions | undefined,
    ) => Promise<QueryObserverResult<TData, ReadContractErrorType>>,
    isSuccess: readContractHookRes.isSuccess,
    status: readContractHookRes.status,
    fetchStatus: readContractHookRes.fetchStatus,
    dataUpdatedAt: readContractHookRes.dataUpdatedAt,
    errorUpdatedAt: readContractHookRes.errorUpdatedAt,
    queryKey: readContractHookRes.queryKey,
  };
};