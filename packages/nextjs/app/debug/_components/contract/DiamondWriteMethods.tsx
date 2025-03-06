"use client";

import { useEffect, useState } from "react";
import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { FacetCategory } from "./DiamondContractUI";
import { Contract } from "~~/utils/scaffold-eth/contract";
import { getAllWriteMethods, getFunctionAbiByName, useFacetsAbi } from "./utilsDiamond";

// 定义每个分类包含的方法
const categoryMethods: Record<Exclude<FacetCategory, "all" | "mockusdc">, string[]> = {
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
      } else if (activeCategory === "mockusdc") {
        // MockUSDC在DiamondContractUI中直接处理
        setWriteMethods([]);
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
    return <p className="text-gray-500">加载合约方法中...</p>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>错误: {error}</p>
        <p className="text-sm mt-2">
          请确保所有合约都已正确部署并在deployedContracts.ts中配置
        </p>
      </div>
    );
  }

  if (!writeMethods || writeMethods.length === 0) {
    if (availableMethods.length > 0) {
      return (
        <div className="text-gray-500 italic">
          <p>此分类没有可用的写入方法。</p>
          <p className="mt-2">可用的写入方法: {availableMethods.join(", ")}</p>
        </div>
      );
    }
    return <p className="text-gray-500 italic">没有可用的写入方法</p>;
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