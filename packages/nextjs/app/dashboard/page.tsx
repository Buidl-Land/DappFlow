"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { useContractRead } from "~~/hooks/contracts/useContractRead";
import { UserTasksTable } from "~~/components/dashboard/UserTasksTable";

// Project data type
type ProjectData = {
  id: number;
  creator: string;
  title: string;
  description: string;
  tags: string[];
  metadata: {
    aiEvaluation: string;
    marketScore: number;
    techFeasibility: string;
    minValuation: number;
    maxValuation: number;
  };
  status: number;
  createdAt: number;
  updatedAt: number;
};

// Funding information type
type FundingInfo = {
  fundingGoal: bigint;
  raisedAmount: bigint;
  startTime: number;
  endTime: number;
  hasMetFundingGoal: boolean;
  paymentToken: string;
};

// Token information type
type TokenInfo = {
  tokenAddress: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  crowdfundingPool: bigint;
  teamPool: bigint;
  ecosystemPool: bigint;
  createdAt: number;
};

// User investment information type
type UserInvestment = {
  projectId: number;
  projectTitle: string;
  contributionAmount: bigint;
  status: string;
  fundingGoal: bigint;
  raisedAmount: bigint;
  fundingProgress: number;
};

// Token release information type
type TokenReleaseInfo = {
  projectId: number;
  projectTitle: string;
  totalTokens: bigint;
  unlockedTokens: bigint;
  vestingStartDate: number;
  vestingEndDate: number;
  percentUnlocked: number;
  tokenSymbol: string;
  releaseSchedule: ReleaseScheduleItem[];
};

// Token release schedule item
type ReleaseScheduleItem = {
  date: number; // Timestamp (seconds)
  percentage: number; // Unlock percentage
  tokenAmount: bigint; // Unlocked token amount
  isUnlocked: boolean; // Whether it's unlocked
};

// Cache object
interface Cache {
  projects: Record<number, ProjectData>;
  fundingInfo: Record<number, FundingInfo>;
  contributions: Record<string, bigint>;
  userContributions: Record<string, number[]>;
  tokenInfo: Record<number, TokenInfo>;
  timestamp: number;
}

// Global cache
const globalCache: Cache = {
  projects: {},
  fundingInfo: {},
  contributions: {},
  userContributions: {},
  tokenInfo: {},
  timestamp: 0
};

// Cache expiry time (milliseconds)
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Parse project data
const parseProjectData = (data: any[]): ProjectData => {
  return {
    id: Number(data[0]),
    creator: data[1],
    title: data[2],
    description: data[3],
    tags: data[4],
    metadata: {
      aiEvaluation: data[5][0],
      marketScore: Number(data[5][1]),
      techFeasibility: data[5][2],
      minValuation: Number(data[5][3]),
      maxValuation: Number(data[5][4]),
    },
    status: Number(data[6]),
    createdAt: Number(data[7]),
    updatedAt: Number(data[8]),
  };
};

// Parse funding information
const parseFundingInfo = (data: any[]): FundingInfo => {
  return {
    fundingGoal: data[0],
    raisedAmount: data[1],
    startTime: Number(data[2]),
    endTime: Number(data[3]),
    hasMetFundingGoal: data[4],
    paymentToken: data[5],
  };
};

// Parse token information
const parseTokenInfo = (data: any[]): TokenInfo => {
  return {
    tokenAddress: data[0],
    name: data[1],
    symbol: data[2],
    totalSupply: data[3],
    crowdfundingPool: data[4],
    teamPool: data[5],
    ecosystemPool: data[6],
    createdAt: Number(data[7]),
  };
};

// Format amount, convert wei to ETH and format
const formatAmount = (amount: bigint): string => {
  const ethAmount = Number(amount) / 1e18;
  return ethAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Format token amount
const formatTokenAmount = (amount: bigint): string => {
  return (Number(amount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Check if cache is expired
const isCacheExpired = (): boolean => {
  return Date.now() - globalCache.timestamp > CACHE_EXPIRY;
};

// User investments table component
const UserInvestmentsTable = () => {
  const { address } = useAccount();
  const { readMethod, isLoading } = useContractRead();
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Get user contributions (project IDs)
  const getUserContributions = useCallback(async (userAddress: string): Promise<number[]> => {
    // Check cache
    const cacheKey = userAddress;
    if (!isCacheExpired() && globalCache.userContributions[cacheKey]) {
      console.log("Using cached user contributions");
      return globalCache.userContributions[cacheKey];
    }

    // Fetch data from blockchain
    const projectIds = await readMethod("getUserContributions", [userAddress]);
    
    if (projectIds && Array.isArray(projectIds)) {
      const numericIds = projectIds.map(id => Number(id));
      // Update cache
      globalCache.userContributions[cacheKey] = numericIds;
      globalCache.timestamp = Date.now();
      return numericIds;
    }
    
    return [];
  }, [readMethod]);

  // Get project information
  const getProject = useCallback(async (projectId: number): Promise<ProjectData | null> => {
    // Check cache
    if (!isCacheExpired() && globalCache.projects[projectId]) {
      console.log(`Using cached project data for ID ${projectId}`);
      return globalCache.projects[projectId];
    }

    // Fetch data from blockchain
    const projectResult = await readMethod("getProject", [projectId]);
    
    if (projectResult) {
      const project = parseProjectData(projectResult as any[]);
      // Update cache
      globalCache.projects[projectId] = project;
      globalCache.timestamp = Date.now();
      return project;
    }
    
    return null;
  }, [readMethod]);

  // Get user's contribution for a project
  const getContribution = useCallback(async (projectId: number, userAddress: string): Promise<bigint> => {
    // Check cache
    const cacheKey = `${projectId}-${userAddress}`;
    if (!isCacheExpired() && globalCache.contributions[cacheKey]) {
      console.log(`Using cached contribution for project ${projectId}`);
      return globalCache.contributions[cacheKey];
    }

    // Fetch data from blockchain
    const contributionResult = await readMethod("getContribution", [projectId, userAddress]);
    
    if (contributionResult) {
      const amount = BigInt(contributionResult.toString());
      // Update cache
      globalCache.contributions[cacheKey] = amount;
      globalCache.timestamp = Date.now();
      return amount;
    }
    
    return 0n;
  }, [readMethod]);

  // Get project funding information
  const getFundingInfo = useCallback(async (projectId: number): Promise<FundingInfo | null> => {
    // Check cache
    if (!isCacheExpired() && globalCache.fundingInfo[projectId]) {
      console.log(`Using cached funding info for project ${projectId}`);
      return globalCache.fundingInfo[projectId];
    }

    // Fetch data from blockchain
    const fundingResult = await readMethod("getFundingInfo", [projectId]);
    
    if (fundingResult) {
      const fundingInfo = parseFundingInfo(fundingResult as any[]);
      // Update cache
      globalCache.fundingInfo[projectId] = fundingInfo;
      globalCache.timestamp = Date.now();
      return fundingInfo;
    }
    
    return null;
  }, [readMethod]);

  useEffect(() => {
    const fetchUserInvestments = async () => {
      if (!address || isLoading) return;
      
      setIsLoadingData(true);
      
      try {
        // Get user contributions (project IDs)
        const projectIds = await getUserContributions(address);
        
        if (projectIds.length === 0) {
          setUserInvestments([]);
          setIsLoadingData(false);
          return;
        }
        
        // Get detailed information for each project
        const investmentsPromises = projectIds.map(async (projectId) => {
          // Fetch project data, contribution amount, and funding info in parallel
          const [project, contributionAmount, fundingInfo] = await Promise.all([
            getProject(projectId),
            getContribution(projectId, address),
            getFundingInfo(projectId)
          ]);
          
          // Determine project status
          let status = "Unknown";
          let fundingGoal = 0n;
          let raisedAmount = 0n;
          let fundingProgress = 0;
          
          if (fundingInfo) {
            fundingGoal = fundingInfo.fundingGoal;
            raisedAmount = fundingInfo.raisedAmount;
            
            // Calculate crowdfunding progress percentage
            fundingProgress = fundingGoal > 0n 
              ? Number((raisedAmount * 100n) / fundingGoal)
              : 0;
            
            const now = new Date();
            const endDate = new Date(fundingInfo.endTime * 1000);
            
            if (fundingInfo.hasMetFundingGoal) {
              status = "Funded";
            } else if (now > endDate) {
              status = "Expired";
            } else {
              status = "Active";
            }
          }
          
          return {
            projectId,
            projectTitle: project ? project.title : `Project #${projectId}`,
            contributionAmount,
            status,
            fundingGoal,
            raisedAmount,
            fundingProgress
          };
        });
        
        const investments = await Promise.all(investmentsPromises);
        setUserInvestments(investments);
      } catch (error) {
        console.error("Failed to fetch user investments:", error);
        setUserInvestments([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchUserInvestments();
  }, [address, isLoading, getUserContributions, getProject, getContribution, getFundingInfo]);
  
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  if (userInvestments.length === 0) {
    return (
      <div className="py-6 text-center rounded-lg sm:py-8 bg-base-200/50">
        <h3 className="mb-2 text-lg font-bold sm:text-xl">No investments yet</h3>
        <p className="mb-4 text-xs opacity-80 sm:text-sm">You haven&apos;t invested in any projects.</p>
        <Link href="/projects" className="btn btn-primary btn-sm sm:btn-md">
          Browse Projects
        </Link>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="table w-full table-sm sm:table-md">
        <thead>
          <tr>
            <th className="text-xs sm:text-sm">Project</th>
            <th className="text-xs sm:text-sm">Contribution</th>
            <th className="text-xs sm:text-sm">Funding Progress</th>
            <th className="text-xs sm:text-sm">Status</th>
            <th className="text-xs sm:text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userInvestments.map((investment) => (
            <tr key={investment.projectId}>
              <td>
                <div className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                  {investment.projectTitle}
                </div>
              </td>
              <td className="text-xs sm:text-sm">${formatAmount(investment.contributionAmount)}</td>
              <td>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <progress 
                      className={`progress w-20 sm:w-24 ${
                        investment.fundingProgress >= 100 ? "progress-success" : "progress-primary"
                      }`} 
                      value={investment.fundingProgress} 
                      max="100"
                    ></progress>
                    <span className="text-xs">{investment.fundingProgress}%</span>
                  </div>
                  <div className="text-xs opacity-70">
                    ${formatAmount(investment.raisedAmount)} / ${formatAmount(investment.fundingGoal)}
                  </div>
                </div>
              </td>
              <td>
                <span
                  className={`badge badge-xs sm:badge-sm ${
                    investment.status === "Active"
                      ? "badge-success"
                      : investment.status === "Funded"
                        ? "badge-info"
                        : "badge-error"
                  }`}
                >
                  {investment.status}
                </span>
              </td>
              <td>
                <Link
                  href={`/projects/${investment.projectId}`}
                  className="btn btn-xs sm:btn-sm btn-outline"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Token unlock progress component
const TokenReleaseSchedule = () => {
  const { address } = useAccount();
  const { readMethod, isLoading } = useContractRead();
  const [tokenReleaseInfo, setTokenReleaseInfo] = useState<TokenReleaseInfo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Get user contributions (project IDs)
  const getUserContributions = useCallback(async (userAddress: string): Promise<number[]> => {
    // Check cache
    const cacheKey = userAddress;
    if (!isCacheExpired() && globalCache.userContributions[cacheKey]) {
      console.log("Using cached user contributions");
      return globalCache.userContributions[cacheKey];
    }

    // Fetch data from blockchain
    const projectIds = await readMethod("getUserContributions", [userAddress]);
    
    if (projectIds && Array.isArray(projectIds)) {
      const numericIds = projectIds.map(id => Number(id));
      // Update cache
      globalCache.userContributions[cacheKey] = numericIds;
      globalCache.timestamp = Date.now();
      return numericIds;
    }
    
    return [];
  }, [readMethod]);

  // Get project information
  const getProject = useCallback(async (projectId: number): Promise<ProjectData | null> => {
    // Check cache
    if (!isCacheExpired() && globalCache.projects[projectId]) {
      console.log(`Using cached project data for ID ${projectId}`);
      return globalCache.projects[projectId];
    }

    // Fetch data from blockchain
    const projectResult = await readMethod("getProject", [projectId]);
    
    if (projectResult) {
      const project = parseProjectData(projectResult as any[]);
      // Update cache
      globalCache.projects[projectId] = project;
      globalCache.timestamp = Date.now();
      return project;
    }
    
    return null;
  }, [readMethod]);

  // Get user's contribution for a project
  const getContribution = useCallback(async (projectId: number, userAddress: string): Promise<bigint> => {
    // Check cache
    const cacheKey = `${projectId}-${userAddress}`;
    if (!isCacheExpired() && globalCache.contributions[cacheKey]) {
      console.log(`Using cached contribution for project ${projectId}`);
      return globalCache.contributions[cacheKey];
    }

    // Fetch data from blockchain
    const contributionResult = await readMethod("getContribution", [projectId, userAddress]);
    
    if (contributionResult) {
      const amount = BigInt(contributionResult.toString());
      // Update cache
      globalCache.contributions[cacheKey] = amount;
      globalCache.timestamp = Date.now();
      return amount;
    }
    
    return 0n;
  }, [readMethod]);

  // Get project funding information
  const getFundingInfo = useCallback(async (projectId: number): Promise<FundingInfo | null> => {
    // Check cache
    if (!isCacheExpired() && globalCache.fundingInfo[projectId]) {
      console.log(`Using cached funding info for project ${projectId}`);
      return globalCache.fundingInfo[projectId];
    }

    // Fetch data from blockchain
    const fundingResult = await readMethod("getFundingInfo", [projectId]);
    
    if (fundingResult) {
      const fundingInfo = parseFundingInfo(fundingResult as any[]);
      // Update cache
      globalCache.fundingInfo[projectId] = fundingInfo;
      globalCache.timestamp = Date.now();
      return fundingInfo;
    }
    
    return null;
  }, [readMethod]);

  // Get project token information
  const getTokenInfo = useCallback(async (projectId: number): Promise<TokenInfo | null> => {
    // Check cache
    if (!isCacheExpired() && globalCache.tokenInfo[projectId]) {
      console.log(`Using cached token info for project ${projectId}`);
      return globalCache.tokenInfo[projectId];
    }

    // Fetch data from blockchain
    const tokenResult = await readMethod("getProjectToken", [projectId]);
    
    if (tokenResult) {
      const tokenInfo = parseTokenInfo(tokenResult as any[]);
      // Update cache
      globalCache.tokenInfo[projectId] = tokenInfo;
      globalCache.timestamp = Date.now();
      return tokenInfo;
    }
    
    return null;
  }, [readMethod]);

  // Calculate token release information
  const calculateTokenRelease = useCallback((
    projectId: number,
    projectTitle: string,
    contribution: bigint,
    fundingInfo: FundingInfo | null,
    tokenInfo: TokenInfo | null
  ): TokenReleaseInfo | null => {
    if (!fundingInfo || !tokenInfo || fundingInfo.raisedAmount === 0n) {
      return null;
    }

    // Calculate total tokens user should receive = (user contribution / total raised) * crowdfunding pool tokens
    const totalTokens = (contribution * tokenInfo.crowdfundingPool) / fundingInfo.raisedAmount;
    
    // Token unlock start time (project crowdfunding end time)
    const vestingStartDate = fundingInfo.endTime;
    
    // Token unlock end time (start time + 180 days)
    const vestingEndDate = vestingStartDate + (180 * 24 * 60 * 60); // 180 days, in seconds
    
    // Current time
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    
    // Calculate unlocked percentage
    let percentUnlocked = 0;
    if (now <= vestingStartDate) {
      percentUnlocked = 0;
    } else if (now >= vestingEndDate) {
      percentUnlocked = 100;
    } else {
      percentUnlocked = Math.floor(((now - vestingStartDate) * 100) / (vestingEndDate - vestingStartDate));
    }
    
    // Calculate unlocked tokens
    const unlockedTokens = (totalTokens * BigInt(percentUnlocked)) / 100n;
    
    // Create unlock schedule (6 nodes, one every 30 days)
    const releaseSchedule: ReleaseScheduleItem[] = [];
    
    // Add intermediate nodes (one every 30 days, total 6 nodes)
    for (let i = 1; i <= 6; i++) {
      const daysPassed = i * 30;
      const date = vestingStartDate + (daysPassed * 24 * 60 * 60);
      const percentage = Math.min(Math.floor((daysPassed * 100) / 180), 100);
      const tokenAmount = (totalTokens * BigInt(percentage)) / 100n;
      
      releaseSchedule.push({
        date,
        percentage,
        tokenAmount,
        isUnlocked: now >= date
      });
    }
    
    return {
      projectId,
      projectTitle,
      totalTokens,
      unlockedTokens,
      vestingStartDate,
      vestingEndDate,
      percentUnlocked,
      tokenSymbol: tokenInfo.symbol,
      releaseSchedule
    };
  }, []);

  useEffect(() => {
    const fetchTokenReleaseInfo = async () => {
      if (!address || isLoading) return;
      
      setIsLoadingData(true);
      
      try {
        // Get user contributions (project IDs)
        const projectIds = await getUserContributions(address);
        
        if (projectIds.length === 0) {
          setTokenReleaseInfo([]);
          setIsLoadingData(false);
          return;
        }
        
        // Get token release information for each project
        const releaseInfoPromises = projectIds.map(async (projectId) => {
          // Fetch project data, contribution amount, funding info, and token info in parallel
          const [project, contribution, fundingInfo, tokenInfo] = await Promise.all([
            getProject(projectId),
            getContribution(projectId, address),
            getFundingInfo(projectId),
            getTokenInfo(projectId)
          ]);
          
          // If project has been created and has tokens, calculate unlock information
          if (project && contribution > 0n && fundingInfo && tokenInfo) {
            return calculateTokenRelease(
              projectId,
              project.title,
              contribution,
              fundingInfo,
              tokenInfo
            );
          }
          
          return null;
        });
        
        const releaseInfoResults = await Promise.all(releaseInfoPromises);
        
        // Filter out null values and sort by unlock date
        const validReleaseInfo = releaseInfoResults
          .filter((info): info is TokenReleaseInfo => info !== null)
          .sort((a, b) => a.vestingEndDate - b.vestingEndDate);
        
        setTokenReleaseInfo(validReleaseInfo);
      } catch (error) {
        console.error("Failed to fetch token release info:", error);
        setTokenReleaseInfo([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchTokenReleaseInfo();
  }, [
    address, 
    isLoading, 
    getUserContributions, 
    getProject, 
    getContribution, 
    getFundingInfo, 
    getTokenInfo, 
    calculateTokenRelease
  ]);
  
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  if (tokenReleaseInfo.length === 0) {
    return (
      <div className="py-6 text-center rounded-lg sm:py-8 bg-base-200/50">
        <h3 className="mb-2 text-lg font-bold sm:text-xl">No token releases yet</h3>
        <p className="mb-4 text-xs opacity-80 sm:text-sm">You don&apos;t have any tokens being released.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Token unlock progress table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="table w-full table-sm sm:table-md">
          <thead>
            <tr>
              <th className="text-xs sm:text-sm">Release Date</th>
              <th className="text-xs sm:text-sm">Project</th>
              <th className="text-xs sm:text-sm">Percentage</th>
              <th className="text-xs sm:text-sm">Tokens</th>
              <th className="text-xs sm:text-sm">Status</th>
              <th className="text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokenReleaseInfo.flatMap((info) => 
              info.releaseSchedule.map((scheduleItem, index) => {
                const releaseDate = new Date(scheduleItem.date * 1000);
                const now = new Date();
                const daysLeft = Math.max(0, differenceInDays(releaseDate, now));
                const isNextRelease = scheduleItem.isUnlocked === false && 
                  info.releaseSchedule.findIndex(item => !item.isUnlocked) === index;
                
                // Only display next unlocked node and most recent unlocked node
                const isRecentUnlocked = scheduleItem.isUnlocked && 
                  (index === info.releaseSchedule.findIndex(item => item.isUnlocked) || 
                   index === info.releaseSchedule.length - 1 || 
                   index === info.releaseSchedule.findIndex(item => !item.isUnlocked) - 1);
                  
                if (!isNextRelease && !isRecentUnlocked) {
                  return null;
                }
                
                return (
                  <tr key={`${info.projectId}-${index}`} className={isNextRelease ? "bg-base-200" : ""}>
                    <td className="text-xs sm:text-sm">
                      {scheduleItem.isUnlocked ? (
                        <span className="text-success">{releaseDate.toLocaleDateString()}</span>
                      ) : (
                        <>
                          <span className="font-medium">{daysLeft} days left</span>
                          <div className="text-xs opacity-70">
                            {releaseDate.toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </td>
                    <td>
                      <div className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                        {info.projectTitle}
                      </div>
                      <div className="text-xs opacity-70">{info.tokenSymbol}</div>
                    </td>
                    <td className="text-xs sm:text-sm">
                      {scheduleItem.percentage}%
                      {index > 0 && (
                        <div className="text-xs opacity-70">
                          +{scheduleItem.percentage - info.releaseSchedule[index - 1].percentage}%
                        </div>
                      )}
                    </td>
                    <td className="text-xs sm:text-sm">
                      <div className="font-medium">
                        {formatTokenAmount(scheduleItem.tokenAmount)}
                      </div>
                      {index > 0 && (
                        <div className="text-xs opacity-70">
                          +{formatTokenAmount(scheduleItem.tokenAmount - info.releaseSchedule[index - 1].tokenAmount)}
                        </div>
                      )}
                    </td>
                    <td>
                      {scheduleItem.isUnlocked ? (
                        <span className="badge badge-xs sm:badge-sm badge-success">Released</span>
                      ) : (
                        <span className="badge badge-xs sm:badge-sm badge-outline">Scheduled</span>
                      )}
                    </td>
                    <td>
                      {isNextRelease && (
                        <button
                          className="btn btn-xs sm:btn-sm btn-primary"
                          disabled={!scheduleItem.isUnlocked}
                          onClick={() => {
                            // Here you can add logic to claim tokens
                            console.log(`Claim tokens for project ${info.projectId}`);
                          }}
                        >
                          Claim Tokens
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }).filter(Boolean)
            )}
          </tbody>
        </table>
      </div>
      
      {/* Token distribution information cards */}
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
        {tokenReleaseInfo.map((info) => (
          <div key={`card-${info.projectId}`} className="card bg-base-200 shadow-sm">
            <div className="p-4 card-body">
              <h3 className="card-title text-sm">{info.projectTitle} Token Distribution</h3>
              <div className="text-xs opacity-80 mb-2">{info.tokenSymbol}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Your Allocation:</span>
                  <span className="text-xs font-medium">{formatTokenAmount(info.totalTokens)} tokens</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs">Unlocked:</span>
                  <span className="text-xs font-medium">{formatTokenAmount(info.unlockedTokens)} tokens ({info.percentUnlocked}%)</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs">Vesting Period:</span>
                  <span className="text-xs font-medium">180 days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs">Vesting End:</span>
                  <span className="text-xs font-medium">
                    {new Date(info.vestingEndDate * 1000).toLocaleDateString()}
                  </span>
                </div>
                
                <progress 
                  className={`progress w-full mt-2 ${
                    info.percentUnlocked >= 100 ? "progress-success" : "progress-primary"
                  }`} 
                  value={info.percentUnlocked} 
                  max="100"
                ></progress>
                
                {/* Display unlock schedule */}
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Release Schedule:</div>
                  <div className="space-y-1">
                    {info.releaseSchedule
                      .filter(item => item.percentage > 0) // Filter out 0% nodes
                      .map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>{new Date(item.date * 1000).toLocaleDateString()} ({item.percentage}%)</span>
                          <span className={item.isUnlocked ? "text-success" : ""}>
                            {formatTokenAmount(item.tokenAmount)}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const {
    address
  } = useAccount();
  const [activeTab, setActiveTab] = useState("projects");
  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [tokenBalance, setTokenBalance] = useState({ unlocked: 0, total: 0 });
  const [investmentDistribution, setInvestmentDistribution] = useState({
    defi: 0,
    nft: 0,
    gaming: 0,
    infrastructure: 0,
    social: 0
  });
  const [investmentStatusDistribution, setInvestmentStatusDistribution] = useState({
    active: 0,
    funded: 0,
    failed: 0,
    pending: 0
  });
  const { readMethod } = useContractRead();

  // Fetch user investments data for summary cards
  const fetchUserInvestmentsSummary = useCallback(async () => {
    if (!address) return;

    try {
      // Get user contributions (project IDs)
      const projectIds = await readMethod("getUserContributions", [address]);
      
      if (projectIds && Array.isArray(projectIds)) {
        const numericIds = projectIds.map(id => Number(id));
        setProjectsCount(numericIds.length);
        
        // Calculate token allocations
        let unlockedTokens = 0;
        let totalUserTokens = 0;
        
        for (const projectId of numericIds) {
          try {
            // Get funding info to calculate crowdfunding pool
            const fundingInfo = await readMethod("getFundingInfo", [projectId]);
            if (!fundingInfo) continue;
            
            const totalRaised = Number(fundingInfo[1]) / 1e18; // raisedAmount at index 1
            const fundingEndTime = Number(fundingInfo[3]); // endTime at index 3
            
            // Get user's contribution for this project
            const userContribution = await readMethod("getContribution", [projectId, address]);
            if (!userContribution) continue;
            
            const userContributionAmount = Number(userContribution) / 1e18;
            
            // Calculate crowdfunding pool tokens (60% of total supply)
            // Formula: crowdfunding amount * 100 * 60%
            const crowdfundingPoolTokens = totalRaised * 100 * 0.6;
            
            // Calculate user's token allocation
            // Formula: (user contribution / total raised) * crowdfunding pool tokens
            const userTokens = userContributionAmount / totalRaised * crowdfundingPoolTokens;
            
            // Calculate unlocked tokens based on vesting schedule (180 days)
            const now = Math.floor(Date.now() / 1000);
            const vestingEndTime = fundingEndTime + (180 * 24 * 60 * 60); // 180 days after funding ends
            
            let unlockedPercentage = 0;
            if (now <= fundingEndTime) {
              unlockedPercentage = 0;
            } else if (now >= vestingEndTime) {
              unlockedPercentage = 100;
            } else {
              unlockedPercentage = Math.floor(((now - fundingEndTime) * 100) / (vestingEndTime - fundingEndTime));
            }
            
            const projectUnlockedTokens = (userTokens * unlockedPercentage) / 100;
            
            unlockedTokens += projectUnlockedTokens;
            totalUserTokens += userTokens;
          } catch (err) {
            console.error(`Error calculating tokens for project ${projectId}:`, err);
          }
        }
        
        setTokenBalance({
          unlocked: unlockedTokens,
          total: totalUserTokens
        });
      }
    } catch (err) {
      console.error("Failed to fetch investment summary:", err);
    }
  }, [address, readMethod]);

  // Fetch user tasks data for summary cards
  const fetchUserTasksSummary = useCallback(async () => {
    if (!address) return;

    try {
      // Get user tasks
      const userTaskIds = await readMethod("getUserTasks", [address]);
      
      if (userTaskIds && Array.isArray(userTaskIds)) {
        setTasksCount(userTaskIds.length);
      }
    } catch (err) {
      console.error("Failed to fetch tasks summary:", err);
    }
  }, [address, readMethod]);

  // Get investment distribution data
  const fetchInvestmentDistribution = useCallback(async () => {
    if (!address) return;

    try {
      // In a real application, this data should be fetched from the contract
      // Here we use mock data for demonstration
      const projectIds = await readMethod("getUserContributions", [address]);
      
      if (projectIds && Array.isArray(projectIds)) {
        // Initialize category counters
        let defiCount = 0;
        let nftCount = 0;
        let gamingCount = 0;
        let infrastructureCount = 0;
        let socialCount = 0;
        
        // Iterate through user's projects
        for (const projectId of projectIds) {
          try {
            // Get project details
            const projectData = await readMethod("getProject", [projectId]);
            
            if (projectData) {
              // Categorize project based on tags
              const tags = projectData[4]; // Assume tags are in index 4
              
              if (tags && Array.isArray(tags)) {
                // Categorize project based on tags
                if (tags.some(tag => tag.toLowerCase().includes('defi'))) {
                  defiCount++;
                } else if (tags.some(tag => tag.toLowerCase().includes('nft'))) {
                  nftCount++;
                } else if (tags.some(tag => tag.toLowerCase().includes('game'))) {
                  gamingCount++;
                } else if (tags.some(tag => tag.toLowerCase().includes('infra'))) {
                  infrastructureCount++;
                } else if (tags.some(tag => tag.toLowerCase().includes('social'))) {
                  socialCount++;
                } else {
                  // If no tags match, randomly assign to a category
                  const randomCategory = Math.floor(Math.random() * 5);
                  switch (randomCategory) {
                    case 0: defiCount++; break;
                    case 1: nftCount++; break;
                    case 2: gamingCount++; break;
                    case 3: infrastructureCount++; break;
                    case 4: socialCount++; break;
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Error processing project ${projectId}:`, err);
          }
        }
        
        // If there's no real data, generate some mock data
        if (defiCount + nftCount + gamingCount + infrastructureCount + socialCount === 0) {
          const total = projectIds.length || 5;
          defiCount = Math.floor(total * 0.3);
          nftCount = Math.floor(total * 0.2);
          gamingCount = Math.floor(total * 0.25);
          infrastructureCount = Math.floor(total * 0.15);
          socialCount = total - defiCount - nftCount - gamingCount - infrastructureCount;
        }
        
        setInvestmentDistribution({
          defi: defiCount,
          nft: nftCount,
          gaming: gamingCount,
          infrastructure: infrastructureCount,
          social: socialCount
        });
      }
    } catch (err) {
      console.error("Failed to fetch investment distribution:", err);
      // Set some default data
      setInvestmentDistribution({
        defi: 3,
        nft: 2,
        gaming: 4,
        infrastructure: 1,
        social: 2
      });
    }
  }, [address, readMethod]);

  // Get investment status distribution
  const fetchInvestmentStatusDistribution = useCallback(async () => {
    if (!address) return;

    try {
      // In a real application, this data should be fetched from the contract
      const projectIds = await readMethod("getUserContributions", [address]);
      
      if (projectIds && Array.isArray(projectIds)) {
        let activeCount = 0;
        let fundedCount = 0;
        let failedCount = 0;
        let pendingCount = 0;
        
        for (const projectId of projectIds) {
          try {
            // Get project funding information
            const fundingInfo = await readMethod("getFundingInfo", [projectId]);
            
            if (fundingInfo) {
              const hasMetFundingGoal = fundingInfo[4]; // Assuming at index 4
              const endTime = Number(fundingInfo[3]); // Assuming at index 3
              const now = Math.floor(Date.now() / 1000);
              
              if (hasMetFundingGoal) {
                fundedCount++;
              } else if (now > endTime) {
                failedCount++;
              } else if (now < endTime) {
                activeCount++;
              } else {
                pendingCount++;
              }
            }
          } catch (err) {
            console.error(`Error processing project status ${projectId}:`, err);
          }
        }
        
        // If there's no real data, generate some mock data
        if (activeCount + fundedCount + failedCount + pendingCount === 0) {
          const total = projectIds.length || 10;
          activeCount = Math.floor(total * 0.4);
          fundedCount = Math.floor(total * 0.3);
          failedCount = Math.floor(total * 0.2);
          pendingCount = total - activeCount - fundedCount - failedCount;
        }
        
        setInvestmentStatusDistribution({
          active: activeCount,
          funded: fundedCount,
          failed: failedCount,
          pending: pendingCount
        });
      }
    } catch (err) {
      console.error("Failed to fetch investment status distribution:", err);
      // Set some default data
      setInvestmentStatusDistribution({
        active: 4,
        funded: 3,
        failed: 2,
        pending: 1
      });
    }
  }, [address, readMethod]);

  // Fetch summary data when component mounts
  useEffect(() => {
    fetchUserInvestmentsSummary();
    fetchUserTasksSummary();
    fetchInvestmentDistribution();
    fetchInvestmentStatusDistribution();
  }, [fetchUserInvestmentsSummary, fetchUserTasksSummary, fetchInvestmentDistribution, fetchInvestmentStatusDistribution]);

  return (
    <div className="flex flex-col pt-20 min-h-screen sm:pt-24 animate-fade-in">
      {/* SVG Background */}
      <div className="fixed inset-0 z-[-1] opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dashboardGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50,0 L0,0 L0,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="currentColor" />
            </pattern>
            <pattern id="dashboardDots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboardDots)" />
          <rect width="100%" height="100%" fill="url(#dashboardGrid)" />
          <rect width="100%" height="100%" fill="url(#fadeGradient)" />
        </svg>
      </div>

      <div className="container px-4 mx-auto">
        {/* Header with glass effect */}
        <div className="mb-10 backdrop-blur-sm bg-base-100/40 p-6 rounded-2xl shadow-xl border border-base-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative">
              <h1 className="text-3xl font-bold sm:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dashboard Overview</h1>
            <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>
            <div className="flex items-center gap-2 bg-base-200/50 rounded-full px-4 py-2 text-sm">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Analytics Section - Moved to top */}
        <div className="mb-8 card bg-base-100 shadow-xl p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Portfolio Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left column - Investment Breakdown */}
            <div className="md:col-span-1 flex flex-col">
              {/* Investment Breakdown Card - Enhanced with charts */}
              <div className="card bg-base-200/50 shadow-sm flex-grow flex flex-col">
                <div className="card-body p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="card-title text-base">Investment Breakdown</h3>
                    
                    {/* Added spacer to push content down */}
                    <div className="flex-grow my-2"></div>
                    
                    <div className="flex flex-col gap-3">
                      {/* Horizontal Bar Chart */}
                      <div className="space-y-3">
                        {/* DeFi Projects */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
                              DeFi Projects
                            </span>
                            <span className="text-sm">{investmentDistribution.defi}</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-primary h-3 rounded-full shadow-inner" 
                              style={{ 
                                width: `${(investmentDistribution.defi / 
                                  (investmentDistribution.defi + 
                                  investmentDistribution.nft + 
                                  investmentDistribution.gaming + 
                                  investmentDistribution.infrastructure + 
                                  investmentDistribution.social)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* NFT Projects */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-secondary inline-block"></span>
                              NFT Projects
                            </span>
                            <span className="text-sm">{investmentDistribution.nft}</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-secondary h-3 rounded-full shadow-inner" 
                              style={{ 
                                width: `${(investmentDistribution.nft / 
                                  (investmentDistribution.defi + 
                                  investmentDistribution.nft + 
                                  investmentDistribution.gaming + 
                                  investmentDistribution.infrastructure + 
                                  investmentDistribution.social)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Gaming Projects */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-accent inline-block"></span>
                              Gaming Projects
                            </span>
                            <span className="text-sm">{investmentDistribution.gaming}</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-accent h-3 rounded-full shadow-inner" 
                              style={{ 
                                width: `${(investmentDistribution.gaming / 
                                  (investmentDistribution.defi + 
                                  investmentDistribution.nft + 
                                  investmentDistribution.gaming + 
                                  investmentDistribution.infrastructure + 
                                  investmentDistribution.social)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Infrastructure Projects */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-info inline-block"></span>
                              Infrastructure
                            </span>
                            <span className="text-sm">{investmentDistribution.infrastructure}</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-info h-3 rounded-full shadow-inner" 
                              style={{ 
                                width: `${(investmentDistribution.infrastructure / 
                                  (investmentDistribution.defi + 
                                  investmentDistribution.nft + 
                                  investmentDistribution.gaming + 
                                  investmentDistribution.infrastructure + 
                                  investmentDistribution.social)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Social Projects */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-success inline-block"></span>
                              Social Projects
                            </span>
                            <span className="text-sm">{investmentDistribution.social}</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-success h-3 rounded-full shadow-inner" 
                              style={{ 
                                width: `${(investmentDistribution.social / 
                                  (investmentDistribution.defi + 
                                  investmentDistribution.nft + 
                                  investmentDistribution.gaming + 
                                  investmentDistribution.infrastructure + 
                                  investmentDistribution.social)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary Stats - Moved to bottom for alignment */}
                  <div className="flex justify-between items-center mt-auto pt-3 text-sm text-center">
                    <div>
                      <div className="font-bold text-lg">{projectsCount}</div>
                      <div className="opacity-70">Total</div>
                    </div>
                    <div className="divider divider-horizontal mx-0"></div>
                    <div>
                      <div className="font-bold text-lg">{investmentStatusDistribution.funded}</div>
                      <div className="opacity-70">Funded</div>
                    </div>
                    <div className="divider divider-horizontal mx-0"></div>
                    <div>
                      <div className="font-bold text-lg">{investmentStatusDistribution.active}</div>
                      <div className="opacity-70">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column - Stats Cards (moved from right) */}
            <div className="md:col-span-1 space-y-3">
              {/* Projects Backed Card */}
              <div className="card bg-gradient-to-br from-primary/80 to-primary text-primary-content shadow-sm">
                <div className="card-body p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-medium opacity-80">Projects Backed</h2>
                      <p className="text-2xl font-bold">{projectsCount}</p>
                    </div>
                    <div className="rounded-full bg-primary-content/20 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-black">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Investment activity
                    </span>
                  </div>
                </div>
              </div>

              {/* Tasks Participated Card */}
              <div className="card bg-gradient-to-br from-secondary/80 to-secondary text-secondary-content shadow-sm">
                <div className="card-body p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-medium opacity-80">Tasks Participated</h2>
                      <p className="text-2xl font-bold">{tasksCount}</p>
                    </div>
                    <div className="rounded-full bg-secondary-content/20 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  </div>
                  <div className="mt-2 text-xs text-secondary-content">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Project contributions
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Balance Card */}
              <div className="card bg-gradient-to-br from-accent/80 to-accent text-accent-content shadow-sm">
                <div className="card-body p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-medium opacity-80">Token Balance</h2>
                      <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold">{tokenBalance.unlocked.toLocaleString()}</p>
                        <p className="text-xs opacity-80">/ {tokenBalance.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-accent-content/20 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                  <div className="mt-2">
                    <div className="w-full bg-accent-content/30 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-accent-content h-full rounded-full" 
                        style={{ width: `${tokenBalance.total > 0 ? (tokenBalance.unlocked / tokenBalance.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-accent-content">
                      <span>Unlocked</span>
                      <span>{tokenBalance.total > 0 ? Math.round((tokenBalance.unlocked / tokenBalance.total) * 100) : 0}%</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>

            {/* Right column - Recent Activity (moved from middle) */}
            <div className="md:col-span-1">
              {/* Recent Activity Card */}
              <div className="card bg-base-200/50 shadow-sm h-full">
                <div className="card-body p-3 sm:p-4">
                  <h3 className="card-title text-sm">Recent Activity</h3>
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-xs">Task Started</h4>
                        <p className="text-2xs opacity-70">Successfully started task </p>
                        <p className="text-2xs opacity-50 mt-0.5">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-xs">Application Approved</h4>
                        <p className="text-2xs opacity-70">Your application for Project was approved</p>
                        <p className="text-2xs opacity-50 mt-0.5">1 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center text-info">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-xs">Task Application</h4>
                        <p className="text-2xs opacity-70">Successfully applied for task</p>
                        <p className="text-2xs opacity-50 mt-0.5">1 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-xs">Crowdfunding Participation</h4>
                        <p className="text-2xs opacity-70">Invested 50000 USDC in Project</p>
                        <p className="text-2xs opacity-50 mt-0.5">2 mins ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="card bg-base-100 shadow-xl overflow-hidden">
          {/* Custom Tabs with Animated Indicator */}
          <div className="bg-base-200/50 p-1 rounded-t-2xl border-b border-base-300">
            <div className="flex relative">
              <button
                className={`flex-1 py-3 px-4 text-center relative z-10 transition-all duration-300 ${activeTab === "projects" ? "text-primary font-medium" : "text-base-content/70 hover:text-base-content"}`}
                onClick={() => setActiveTab("projects")}
              >
                <div className="flex justify-center items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>My Investments</span>
                </div>
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center relative z-10 transition-all duration-300 ${activeTab === "tasks" ? "text-primary font-medium" : "text-base-content/70 hover:text-base-content"}`}
                onClick={() => setActiveTab("tasks")}
              >
                <div className="flex justify-center items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>My Tasks</span>
                </div>
              </button>
              {/* Animated Tab Indicator */}
              <div 
                className={`absolute bottom-0 h-0.5 bg-primary transition-all duration-300 rounded-full`}
                style={{ 
                  left: activeTab === "projects" ? "0%" : "50%", 
                  width: "50%",
                  transform: activeTab === "projects" ? "translateX(0%)" : "translateX(0%)"
                }}
              ></div>
            </div>
            </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Projects Tab Content */}
            {activeTab === "projects" && (
              <div className="space-y-8">
                {/* Investments Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      My Investments
                    </h2>
                    <Link href="/projects" className="btn btn-primary btn-sm gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Invest More
                    </Link>
                  </div>
                  <div className="bg-base-200/30 rounded-xl p-1">
                    <UserInvestmentsTable />
                  </div>
                </div>

                {/* Token Release Schedule Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Token Release Schedule
                    </h2>
                    <button className="btn btn-outline btn-sm gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How Vesting Works
                    </button>
                  </div>
                  <div className="bg-base-200/30 rounded-xl p-1">
                    <TokenReleaseSchedule />
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab Content */}
            {activeTab === "tasks" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Tasks
                  </h2>
                  <Link href="/projects" className="btn btn-primary btn-sm gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Tasks
                  </Link>
                </div>
                <div className="bg-base-200/30 rounded-xl p-1">
                  <UserTasksTable />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
