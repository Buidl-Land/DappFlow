import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";
import { ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * 获取所有Facet的ABI
 */
export const useFacetsAbi = () => {
  const { data: diamondData, isLoading: diamondLoading } = useDeployedContractInfo({ 
    contractName: "Diamond" as ContractName 
  });
  
  // 确保Diamond合约的ABI始终可用
  if (!diamondData?.abi && !diamondLoading) {
    console.error("Diamond contract ABI not found");
  }
  
  // 使用Diamond合约的ABI作为基础，即使其他Facet的ABI加载失败，也能保证基本功能
  const combinedAbi = [...(diamondData?.abi || [])] as Abi;
  
  // 如果Diamond合约的ABI为空，提供一个基本的ABI以避免"ABI is required"错误
  if (combinedAbi.length === 0 && !diamondLoading) {
    console.warn("Using fallback ABI as Diamond ABI is empty");
    // 添加一个基本的回退ABI，包含一些常见的Diamond方法
    combinedAbi.push(
      {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
      },
      {
        type: "function",
        name: "facetAddresses",
        inputs: [],
        outputs: [{ name: "facetAddresses_", type: "address[]", internalType: "address[]" }],
        stateMutability: "view"
      }
    );
    
    // 添加Diamond标准的基本方法
    addDiamondStandardAbi(combinedAbi);
  }
  
  // 尝试加载其他Facet的ABI，但不阻止页面渲染
  try {
    const { data: accessControlFacetData } = useDeployedContractInfo({ 
      contractName: "AccessControlFacet" as ContractName 
    });
    if (accessControlFacetData?.abi) {
      combinedAbi.push(...accessControlFacetData.abi);
    }
  } catch (error) {
    console.warn("Failed to load AccessControlFacet ABI:", error);
  }
  
  try {
    const { data: projectFacetData } = useDeployedContractInfo({ 
      contractName: "ProjectFacet" as ContractName 
    });
    if (projectFacetData?.abi) {
      combinedAbi.push(...projectFacetData.abi);
    }
  } catch (error) {
    console.warn("Failed to load ProjectFacet ABI:", error);
  }
  
  try {
    const { data: crowdfundingFacetData } = useDeployedContractInfo({ 
      contractName: "CrowdfundingFacet" as ContractName 
    });
    if (crowdfundingFacetData?.abi) {
      combinedAbi.push(...crowdfundingFacetData.abi);
    }
  } catch (error) {
    console.warn("Failed to load CrowdfundingFacet ABI:", error);
  }
  
  try {
    const { data: taskMarketFacetData } = useDeployedContractInfo({ 
      contractName: "TaskMarketFacet" as ContractName 
    });
    if (taskMarketFacetData?.abi) {
      combinedAbi.push(...taskMarketFacetData.abi);
    }
  } catch (error) {
    console.warn("Failed to load TaskMarketFacet ABI:", error);
  }
  
  try {
    const { data: projectTokenFacetData } = useDeployedContractInfo({ 
      contractName: "ProjectTokenFacet" as ContractName 
    });
    if (projectTokenFacetData?.abi) {
      combinedAbi.push(...projectTokenFacetData.abi);
    }
  } catch (error) {
    console.warn("Failed to load ProjectTokenFacet ABI:", error);
  }

  // 去重，避免重复的函数定义
  const uniqueAbi = combinedAbi.filter((item, index, self) => {
    if (!item || !item.type) return false;
    
    if (item.type !== 'function') return true;
    
    return index === self.findIndex(t => 
      t && t.type === 'function' && 
      t.name === item.name && 
      JSON.stringify(t.inputs) === JSON.stringify(item.inputs)
    );
  }) as Abi;

  return {
    combinedAbi: uniqueAbi,
    facets: {
      diamond: diamondData
    },
    isLoading: diamondLoading
  };
};

/**
 * 添加Diamond标准的基本ABI
 */
function addDiamondStandardAbi(abiArray: any[]) {
  // 添加Diamond标准的基本方法
  abiArray.push(
    // Diamond Loupe 方法
    {
      type: "function",
      name: "facets",
      inputs: [],
      outputs: [
        {
          name: "facets_",
          type: "tuple[]",
          components: [
            { name: "facetAddress", type: "address" },
            { name: "functionSelectors", type: "bytes4[]" }
          ]
        }
      ],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "facetFunctionSelectors",
      inputs: [{ name: "_facet", type: "address" }],
      outputs: [{ name: "_facetFunctionSelectors", type: "bytes4[]" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "facetAddresses",
      inputs: [],
      outputs: [{ name: "facetAddresses_", type: "address[]" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "facetAddress",
      inputs: [{ name: "_functionSelector", type: "bytes4" }],
      outputs: [{ name: "facetAddress_", type: "address" }],
      stateMutability: "view"
    },
    
    // 所有权方法
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [{ name: "_newOwner", type: "address" }],
      outputs: [],
      stateMutability: "nonpayable"
    }
  );
  
  // 添加AccessControl基本方法
  abiArray.push(
    {
      type: "function",
      name: "hasRole",
      inputs: [
        { name: "role", type: "bytes32" },
        { name: "account", type: "address" }
      ],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "getRoleAdmin",
      inputs: [{ name: "role", type: "bytes32" }],
      outputs: [{ name: "", type: "bytes32" }],
      stateMutability: "view"
    }
  );
}

/**
 * 根据方法名获取对应的ABI
 */
export const getFunctionAbiByName = (methodName: string, combinedAbi: Abi) => {
  if (!combinedAbi || combinedAbi.length === 0) {
    console.error(`No ABI available when looking for method: ${methodName}`);
    return null;
  }
  
  const abiFunction = combinedAbi.find(
    part => part && part.type === "function" && part.name === methodName
  );
  
  if (!abiFunction) {
    console.warn(`ABI for method ${methodName} not found`);
  }
  
  return abiFunction;
};

/**
 * 获取所有读取方法
 */
export const getAllReadMethods = (combinedAbi: Abi) => {
  if (!combinedAbi || combinedAbi.length === 0) {
    console.error("No ABI available when getting read methods");
    return [];
  }
  
  return combinedAbi
    .filter(part => 
      part && part.type === "function" && 
      (part.stateMutability === "view" || part.stateMutability === "pure")
    )
    .map(part => part.name);
};

/**
 * 获取所有写入方法
 */
export const getAllWriteMethods = (combinedAbi: Abi) => {
  if (!combinedAbi || combinedAbi.length === 0) {
    console.error("No ABI available when getting write methods");
    return [];
  }
  
  return combinedAbi
    .filter(part => 
      part && part.type === "function" && 
      (part.stateMutability === "nonpayable" || part.stateMutability === "payable")
    )
    .map(part => part.name);
}; 