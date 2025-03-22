import { Abi, AbiFunction } from "abitype";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import externalContracts from "~~/contracts/externalContracts";
import deployedContracts from "~~/contracts/deployedContracts";

/**
 * Get ABI for all Facets
 */
export const useFacetsAbi = () => {
  const { targetNetwork } = useTargetNetwork();
  const { data: diamondData, isLoading: diamondLoading } = useDeployedContractInfo({ 
    contractName: "Diamond" as ContractName 
  });
  
  // Get external contract data
  const chainId = targetNetwork.id;
  const mockUsdcData = externalContracts[chainId as keyof typeof externalContracts]?.["MockUSDC"];
  
  // Get deployed contract data for the target network
  const networkDeployedContracts = deployedContracts[chainId as keyof typeof deployedContracts];
  
  // Ensure Diamond contract ABI is always available
  if (!diamondData?.abi && !diamondLoading) {
    console.error("Diamond contract ABI not found");
  }
  
  // Use Diamond contract ABI as base, ensure basic functionality even if other Facet ABIs fail to load
  let combinedAbi: any[] = [...(diamondData?.abi || [])];
  
  // Add MockUSDC ABI if exists
  if (mockUsdcData?.abi) {
    combinedAbi = [...combinedAbi, ...mockUsdcData.abi];
  }
  
  // Add facets ABIs if deployed contracts for the network exist
  if (networkDeployedContracts) {
    // Add Access Control Facet ABI
    if (networkDeployedContracts.AccessControlFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.AccessControlFacet.abi];
    }
    
    // Add Project Token Facet ABI
    if (networkDeployedContracts.ProjectTokenFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.ProjectTokenFacet.abi];
    }
    
    // Add Crowdfunding Facet ABI
    if (networkDeployedContracts.CrowdfundingFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.CrowdfundingFacet.abi];
    }
    
    // Add Project Facet ABI
    if (networkDeployedContracts.ProjectFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.ProjectFacet.abi];
    }
    
    // Add Task Market Facet ABI
    if (networkDeployedContracts.TaskMarketFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.TaskMarketFacet.abi];
    }
    
    // Add Diamond Cut Facet ABI for Diamond Standard functionality
    if (networkDeployedContracts.DiamondCutFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.DiamondCutFacet.abi];
    }
  } else {
    console.warn(`No deployed contracts found for network ID: ${chainId}`);
  }
  
  return {
    combinedAbi: combinedAbi as Abi,
    isLoading: diamondLoading,
    diamondAddress: diamondData?.address,
  };
};

/**
 * Get ABI function definition by method name
 */
export const getFunctionAbiByName = (methodName: string, combinedAbi: Abi) => {
  if (!combinedAbi) return null;
  
  // Find matching function ABI
  const abiFunction = (combinedAbi as any[]).find(
    (func) => func.type === "function" && func.name === methodName
  ) as AbiFunction;
  
  return abiFunction || null;
};

/**
 * Get all read-only methods
 */
export const getAllReadMethods = (combinedAbi: Abi) => {
  if (!combinedAbi) return [];
  
  // Filter all read-only methods
  return (combinedAbi as any[])
    .filter((func) => func.type === "function" && (func.stateMutability === "view" || func.stateMutability === "pure"))
    .map((func) => func.name);
};

/**
 * Get all write methods
 */
export const getAllWriteMethods = (combinedAbi: Abi) => {
  if (!combinedAbi) return [];
  
  // Filter all write methods
  return (combinedAbi as any[])
    .filter((func) => func.type === "function" && func.stateMutability !== "view" && func.stateMutability !== "pure")
    .map((func) => func.name);
}; 