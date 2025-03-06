"use client";

import { useEffect, useState } from "react";
import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { FacetCategory } from "./DiamondContractUI";
import { Contract } from "~~/utils/scaffold-eth/contract";
import { getAllReadMethods, getFunctionAbiByName, useFacetsAbi } from "./utilsDiamond";

// 定义每个分类包含的方法
const categoryMethods: Record<Exclude<FacetCategory, "all" | "mockusdc">, string[]> = {
  accessControl: [
    "hasRole", 
    "getRoleAdmin", 
    "isAdmin", 
    "ADMIN_ROLE", 
    "PROJECT_CREATOR_ROLE", 
    "FUNDING_MANAGER_ROLE", 
    "TASK_CREATOR_ROLE", 
    "AI_AGENT_ROLE"
  ],
  project: [
    "getProject", 
    "getProjects", 
    "getProjectCount", 
    "getProjectsByOwner", 
    "getProjectStatus", 
    "getProjectDetails", 
    "getProjectMembers"
  ],
  crowdfunding: [
    "getContribution", 
    "getTotalContributions", 
    "getContributorCount", 
    "getContributors", 
    "getContributionsByUser", 
    "getFundingGoal", 
    "getFundingDeadline", 
    "isFundingSuccessful"
  ],
  taskMarket: [
    "getTask", 
    "getTasks", 
    "getTaskCount", 
    "getTasksByProject", 
    "getTasksByAssignee", 
    "getTaskStatus", 
    "getTaskReward", 
    "getTaskDeadline", 
    "getTaskApplicants"
  ],
  projectToken: [
    "getProjectToken", 
    "getClaimedAmount", 
    "getTokenBalance", 
    "getTotalSupply", 
    "getTokenAllocation", 
    "getVestingSchedule", 
    "getTokenSymbol", 
    "getTokenName"
  ]
};

type DiamondReadMethodsProps = {
  diamondContractData: Contract<"Diamond">;
  activeCategory: FacetCategory;
};

export const DiamondReadMethods = ({ diamondContractData, activeCategory }: DiamondReadMethodsProps) => {
  const [readMethods, setReadMethods] = useState<string[]>([]);
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
      // 获取所有读取方法
      const allMethods = getAllReadMethods(combinedAbi);
      setAvailableMethods(allMethods);
      
      // 根据活动分类过滤方法
      if (activeCategory === "all") {
        setReadMethods(allMethods);
      } else if (activeCategory === "mockusdc") {
        // MockUSDC在DiamondContractUI中直接处理
        setReadMethods([]);
      } else {
        // 首先尝试使用预定义的分类
        const predefinedMethods = categoryMethods[activeCategory];
        
        // 过滤出实际存在于ABI中的方法
        const filteredMethods = predefinedMethods.filter(method => 
          allMethods.includes(method)
        );
        
        // 如果过滤后没有方法，则显示所有读取方法
        if (filteredMethods.length === 0) {
          setReadMethods(allMethods);
        } else {
          setReadMethods(filteredMethods);
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

  if (!readMethods || readMethods.length === 0) {
    if (availableMethods.length > 0) {
      return (
        <div className="text-gray-500 italic">
          <p>此分类没有可用的读取方法。</p>
          <p className="mt-2">可用的读取方法: {availableMethods.join(", ")}</p>
        </div>
      );
    }
    return <p className="text-gray-500 italic">没有可用的读取方法</p>;
  }

  return (
    <>
      {readMethods.map(methodName => {
        const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
        if (!abiFunction) return null;
        
        return (
          <div key={methodName} className="py-3 first:pt-0 last:pb-0">
            <ReadOnlyFunctionForm
              abiFunction={abiFunction}
              contractAddress={diamondContractData.address}
              abi={combinedAbi}
            />
          </div>
        );
      })}
    </>
  );
}; 