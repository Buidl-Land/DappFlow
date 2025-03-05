"use client";

import { useReducer, useState } from "react";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { DiamondReadMethods } from "./DiamondReadMethods";
import { DiamondWriteMethods } from "./DiamondWriteMethods";
import { useFacetsAbi } from "./utilsDiamond";

type DiamondContractUIProps = {
  className?: string;
};

export type FacetCategory = "all" | "accessControl" | "project" | "crowdfunding" | "taskMarket" | "projectToken";

/**
 * UI component to interface with the Diamond contract and its facets.
 **/
export const DiamondContractUI = ({ className = "" }: DiamondContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const [activeCategory, setActiveCategory] = useState<FacetCategory>("all");
  const { targetNetwork } = useTargetNetwork();
  const { data: diamondContractData, isLoading: diamondContractLoading } = useDeployedContractInfo({ 
    contractName: "Diamond" as ContractName 
  });
  const { combinedAbi, facets, isLoading: abiLoading } = useFacetsAbi();
  const networkColor = useNetworkColor();
  const [showAbiError, setShowAbiError] = useState(false);
  const [forceReload, setForceReload] = useState(false);

  // 检查ABI是否有效
  const hasValidAbi = combinedAbi && combinedAbi.length > 0;

  // 在组件加载后5秒检查ABI状态
  useState(() => {
    const timer = setTimeout(() => {
      if (!hasValidAbi && !abiLoading) {
        setShowAbiError(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  });

  // 强制重新加载页面
  const handleForceReload = () => {
    window.location.reload();
  };

  // 使用本地存储的ABI
  const handleUseLocalAbi = () => {
    setForceReload(true);
    // 重新加载会触发useFacetsAbi中的回退ABI逻辑
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (diamondContractLoading) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!diamondContractData) {
    return (
      <div className="mt-14 text-center">
        <p className="text-3xl mb-4">
          {`Diamond contract not found on chain "${targetNetwork.name}"!`}
        </p>
        <p className="text-lg">
          Please make sure the Diamond contract is properly deployed and configured in deployedContracts.ts
        </p>
      </div>
    );
  }

  const facetCategories: { id: FacetCategory; name: string; description: string }[] = [
    { id: "all", name: "All Facets", description: "All Diamond facets combined" },
    { id: "accessControl", name: "Access Control", description: "Role management and access control" },
    { id: "project", name: "Project", description: "Project creation and management" },
    { id: "crowdfunding", name: "Crowdfunding", description: "Project funding and contributions" },
    { id: "taskMarket", name: "Task Market", description: "Task creation, assignment and completion" },
    { id: "projectToken", name: "Project Token", description: "Project token creation and distribution" }
  ];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0 ${className}`}>
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <span className="font-bold">Diamond Contract</span>
                <Address address={diamondContractData.address} onlyEnsOrAddress />
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-sm">Balance:</span>
                  <Balance address={diamondContractData.address} className="px-0 h-1.5 min-h-[0.375rem]" />
                </div>
              </div>
            </div>
            {targetNetwork && (
              <p className="my-0 text-sm">
                <span className="font-bold">Network</span>:{" "}
                <span style={{ color: networkColor }}>{targetNetwork.name}</span>
              </p>
            )}
            {abiLoading && (
              <div className="mt-2">
                <span className="loading loading-spinner loading-xs mr-2"></span>
                <span className="text-sm">Loading ABI...</span>
              </div>
            )}
            {showAbiError && !hasValidAbi && !abiLoading && (
              <div className="mt-2 text-error text-sm">
                <p>ABI loading error: ABI is required</p>
                <p>Please check deployedContracts.ts configuration</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    className="btn btn-xs btn-error"
                    onClick={handleForceReload}
                  >
                    Reload Page
                  </button>
                  <button 
                    className="btn btn-xs btn-warning"
                    onClick={handleUseLocalAbi}
                  >
                    Use Fallback ABI
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="bg-base-300 rounded-3xl px-6 lg:px-8 py-4 shadow-lg shadow-base-300">
            <h3 className="font-bold text-lg mb-4">Diamond Facets</h3>
            <div className="flex flex-col gap-2">
              {facetCategories.map(category => (
                <button
                  key={category.id}
                  className={`btn btn-sm ${activeCategory === category.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm">
              <p>{facetCategories.find(c => c.id === activeCategory)?.description}</p>
            </div>
            <div className="mt-4">
              <button 
                className="btn btn-sm btn-secondary w-full"
                onClick={handleForceReload}
              >
                Reload ABI
              </button>
              <p className="text-xs mt-2">
                If you're seeing ABI errors, try reloading the page
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
              <div className="h-[5rem] w-[5.5rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Read</p>
                </div>
              </div>
              <div className="p-5 divide-y divide-base-300">
                <DiamondReadMethods 
                  diamondContractData={diamondContractData} 
                  activeCategory={activeCategory}
                />
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
              <div className="h-[5rem] w-[5.5rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Write</p>
                </div>
              </div>
              <div className="p-5 divide-y divide-base-300">
                <DiamondWriteMethods
                  diamondContractData={diamondContractData}
                  onChange={triggerRefreshDisplayVariables}
                  activeCategory={activeCategory}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 