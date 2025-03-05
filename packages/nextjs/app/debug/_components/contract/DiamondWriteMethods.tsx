"use client";

import { useEffect, useState } from "react";
import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { FacetCategory } from "./DiamondContractUI";
import { Contract } from "~~/utils/scaffold-eth/contract";
import { getAllWriteMethods, getFunctionAbiByName, useFacetsAbi } from "./utilsDiamond";

// 定义每个分类包含的方法
const categoryMethods: Record<Exclude<FacetCategory, "all">, string[]> = {
  accessControl: [
    "grantRole", 
    "revokeRole", 
    "renounceRole", 
    "addAdmin", 
    "removeAdmin", 
    "grantProjectCreatorRole", 
    "grantFundingManagerRole", 
    "grantTaskCreatorRole", 
    "grantAiAgentRole"
  ],
  project: [
    "createProject", 
    "updateProject", 
    "deleteProject", 
    "addProjectMember", 
    "removeProjectMember", 
    "setProjectStatus", 
    "updateProjectDetails", 
    "archiveProject"
  ],
  crowdfunding: [
    "contribute", 
    "withdrawContribution", 
    "setFundingGoal", 
    "setFundingDeadline", 
    "releaseFunds", 
    "refundContributors", 
    "createCrowdfunding", 
    "closeCrowdfunding"
  ],
  taskMarket: [
    "createTask", 
    "updateTask", 
    "deleteTask", 
    "assignTask", 
    "completeTask", 
    "approveTask", 
    "rejectTask", 
    "applyForTask", 
    "setTaskReward", 
    "setTaskDeadline"
  ],
  projectToken: [
    "createProjectToken", 
    "mintTokens", 
    "burnTokens", 
    "transferTokens", 
    "claimTokens", 
    "setTokenAllocation", 
    "setVestingSchedule", 
    "pauseTokenTransfers", 
    "unpauseTokenTransfers"
  ]
};

type DiamondWriteMethodsProps = {
  diamondContractData: Contract<"Diamond">;
  activeCategory: FacetCategory;
  onChange?: () => void;
};

export const DiamondWriteMethods = ({ diamondContractData, activeCategory, onChange }: DiamondWriteMethodsProps) => {
  const [writeMethods, setWriteMethods] = useState<string[]>([]);
  const { combinedAbi, isLoading } = useFacetsAbi();
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  useEffect(() => {
    if (!diamondContractData) {
      setError("Diamond contract data is missing");
      return;
    }
    
    if (!combinedAbi || combinedAbi.length === 0) {
      if (!isLoading) {
        setError("ABI is required but not available");
      }
      return;
    } else {
      setError(null);
    }
    
    try {
      // 获取所有写入方法
      const allMethods = getAllWriteMethods(combinedAbi);
      setAvailableMethods(allMethods);
      
      // 根据活动分类过滤方法
      if (activeCategory === "all") {
        setWriteMethods(allMethods);
      } else {
        // 首先尝试使用预定义的分类
        const predefinedMethods = categoryMethods[activeCategory];
        
        // 过滤出实际存在于ABI中的方法
        const filteredMethods = predefinedMethods.filter(method => 
          allMethods.includes(method)
        );
        
        // 如果过滤后没有方法，则显示所有写入方法
        if (filteredMethods.length === 0) {
          setWriteMethods(allMethods);
        } else {
          setWriteMethods(filteredMethods);
        }
      }
    } catch (err) {
      console.error("Error processing ABI:", err);
      setError("Error processing ABI data");
    }
  }, [diamondContractData, combinedAbi, activeCategory, isLoading]);

  if (isLoading) {
    return <p className="text-gray-500">Loading contract methods...</p>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>Error: {error}</p>
        <p className="text-sm mt-2">
          Please make sure all contracts are properly deployed and configured in deployedContracts.ts
        </p>
      </div>
    );
  }

  if (!writeMethods || writeMethods.length === 0) {
    if (availableMethods.length > 0) {
      return (
        <div className="text-gray-500 italic">
          <p>No write methods available for this category.</p>
          <p className="mt-2">Available write methods: {availableMethods.join(", ")}</p>
        </div>
      );
    }
    return <p className="text-gray-500 italic">No write methods available</p>;
  }

  return (
    <>
      {writeMethods.map(methodName => {
        const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
        if (!abiFunction) return null;
        
        return (
          <div key={methodName} className="py-3 first:pt-0 last:pb-0">
            <WriteOnlyFunctionForm
              abiFunction={abiFunction}
              contractAddress={diamondContractData.address}
              abi={combinedAbi}
              onChange={onChange}
            />
          </div>
        );
      })}
    </>
  );
}; 