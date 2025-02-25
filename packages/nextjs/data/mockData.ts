export type TaskStatus = "open" | "in_progress" | "completed";
export type ProjectStatus = "active" | "completed" | "failed";

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: TaskStatus;
  assignee?: string;
  completedDate?: string;
}

export interface ProjectUpdate {
  title: string;
  content: string;
  date: string;
}

export interface Milestone {
  title: string;
  description: string;
  deliverables: string;
  deadline: string;
  status: "pending" | "completed";
}

export interface UnlockSchedule {
  date: string;
  percentage: number;
  unlocked: boolean;
}

export interface UserParticipation {
  projectId: string;
  investedAmount: number;
  tokenAmount: number;
  status: "active" | "completed" | "failed";
  unlockSchedule: UnlockSchedule[];
}

export interface TaskReward {
  amount: number;
  token: string;
}

export interface UserTask {
  taskId: string;
  status: "applied" | "in_progress" | "completed";
  appliedDate: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  summary: string;
  fundingGoal: number;
  raisedAmount: number;
  endDate: string;
  creator: string;
  category: string;
  status: ProjectStatus;
  tags: string[];
  participants: {
    address: string;
    contribution: number;
  }[];
  tasks: Task[];
  roadmap: Milestone[];
  updates: ProjectUpdate[];
}

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Decentralized Identity Solution",
    description:
      "Building a privacy-focused identity verification system using zero-knowledge proofs and blockchain technology. Our solution enables users to prove their identity without revealing sensitive information.",
    summary: "Privacy-focused blockchain identity verification",
    fundingGoal: 50000,
    raisedAmount: 35000,
    endDate: "2024-04-01",
    creator: "0x1234567890123456789012345678901234567890",
    category: "Identity",
    status: "active",
    tags: ["Privacy", "ZK-Proofs", "Identity"],
    participants: [
      { address: "0xabc...123", contribution: 10000 },
      { address: "0xdef...456", contribution: 25000 },
    ],
    tasks: [
      {
        id: "1-1",
        title: "Implement zk-SNARK Circuit",
        description: "Design and implement the zero-knowledge circuit for identity verification.",
        reward: 5000,
        status: "open",
      },
      {
        id: "1-2",
        title: "Smart Contract Integration",
        description: "Develop and audit smart contracts for the identity registry.",
        reward: 4000,
        status: "in_progress",
        assignee: "0x9876543210987654321098765432109876543210",
      },
    ],
    roadmap: [
      {
        title: "Research & Design",
        description: "Complete system architecture and cryptographic protocol design",
        deliverables: "System architecture document, Protocol specifications, Security analysis report",
        deadline: "2024-02-15",
        status: "completed",
      },
      {
        title: "MVP Development",
        description: "Develop core protocol components and smart contracts",
        deliverables: "Working prototype, Smart contract implementation, Technical documentation",
        deadline: "2024-04-30",
        status: "pending",
      },
    ],
    updates: [
      {
        title: "Research Phase Completed",
        content: "Successfully completed the research phase with comprehensive security analysis and protocol design.",
        date: "2024-02-15",
      },
      {
        title: "Development Progress Update",
        content: "Smart contract implementation is 60% complete with initial security audit findings addressed.",
        date: "2024-03-01",
      },
    ],
  },
  {
    id: "2",
    title: "DeFi Lending Protocol",
    description:
      "A novel lending protocol with dynamic interest rates and multi-token collateral pools. Our system uses advanced algorithms to optimize lending efficiency.",
    summary: "Advanced DeFi lending with dynamic rates",
    fundingGoal: 75000,
    raisedAmount: 45000,
    endDate: "2024-05-15",
    creator: "0x2345678901234567890123456789012345678901",
    category: "DeFi",
    status: "active",
    tags: ["DeFi", "Lending", "Yield"],
    participants: [
      { address: "0xghi...789", contribution: 20000 },
      { address: "0xjkl...012", contribution: 25000 },
    ],
    tasks: [
      {
        id: "2-1",
        title: "Interest Rate Model",
        description: "Develop and simulate the dynamic interest rate model.",
        reward: 3000,
        status: "completed",
        assignee: "0x8765432109876543210987654321098765432109",
        completedDate: "2024-02-20",
      },
      {
        id: "2-2",
        title: "Liquidation Engine",
        description: "Implement efficient liquidation mechanisms.",
        reward: 4500,
        status: "open",
      },
    ],
    roadmap: [
      {
        title: "Protocol Design",
        description: "Design interest rate models and liquidation mechanisms",
        deliverables: "Interest rate model documentation, Liquidation mechanism specifications",
        deadline: "2024-03-01",
        status: "completed",
      },
      {
        title: "Smart Contract Development",
        description: "Implement core lending protocol contracts",
        deliverables: "Core smart contracts, Test suite, Integration guide",
        deadline: "2024-05-30",
        status: "pending",
      },
    ],
    updates: [
      {
        title: "Interest Rate Model Implementation",
        content: "Successfully completed and tested the dynamic interest rate model.",
        date: "2024-02-20",
      },
      {
        title: "Security Audit Initiated",
        content: "Engaged with top security firms for comprehensive protocol audit.",
        date: "2024-03-10",
      },
    ],
  },
  {
    id: "3",
    title: "NFT Gaming Platform",
    description:
      "Create a cross-chain gaming platform with interoperable NFT assets and play-to-earn mechanics. Features include cross-chain asset transfers and in-game marketplaces.",
    summary: "Cross-chain NFT gaming ecosystem",
    fundingGoal: 100000,
    raisedAmount: 80000,
    endDate: "2024-06-30",
    creator: "0x3456789012345678901234567890123456789012",
    category: "Gaming",
    status: "active",
    tags: ["Gaming", "NFT", "Cross-chain"],
    participants: [
      { address: "0xmno...345", contribution: 40000 },
      { address: "0xpqr...678", contribution: 40000 },
    ],
    tasks: [
      {
        id: "3-1",
        title: "Asset Bridge Implementation",
        description: "Develop cross-chain NFT bridge contracts.",
        reward: 6000,
        status: "open",
      },
      {
        id: "3-2",
        title: "Game Smart Contracts",
        description: "Create core gaming smart contracts.",
        reward: 5500,
        status: "in_progress",
        assignee: "0x7654321098765432109876543210987654321098",
      },
    ],
    roadmap: [
      {
        title: "Core Mechanics",
        description: "Implement basic game mechanics and NFT integration",
        deliverables: "Game mechanics documentation, NFT standard implementation, Test environment",
        deadline: "2024-04-15",
        status: "pending",
      },
      {
        title: "Cross-chain Bridge",
        description: "Develop and audit cross-chain asset bridge",
        deliverables: "Bridge smart contracts, Security audit report, Integration documentation",
        deadline: "2024-07-01",
        status: "pending",
      },
    ],
    updates: [
      {
        title: "Game Design Complete",
        content: "Finalized core game mechanics and tokenomics design.",
        date: "2024-02-28",
      },
      {
        title: "NFT Standard Development",
        content: "Completed the implementation of cross-chain NFT standard.",
        date: "2024-03-15",
      },
    ],
  },
];

// Mock data for dashboard
export const mockUserParticipations: UserParticipation[] = [
  {
    projectId: "1",
    investedAmount: 5000,
    tokenAmount: 50000,
    status: "active",
    unlockSchedule: [
      { date: "2024-03-01", percentage: 20, unlocked: true },
      { date: "2024-04-01", percentage: 30, unlocked: false },
      { date: "2024-05-01", percentage: 50, unlocked: false },
    ],
  },
  {
    projectId: "2",
    investedAmount: 3000,
    tokenAmount: 30000,
    status: "active",
    unlockSchedule: [
      { date: "2024-03-15", percentage: 25, unlocked: true },
      { date: "2024-04-15", percentage: 25, unlocked: false },
      { date: "2024-05-15", percentage: 50, unlocked: false },
    ],
  },
];

export const mockUserTasks: UserTask[] = [
  {
    taskId: "1-1",
    status: "completed",
    appliedDate: "2024-02-01",
  },
  {
    taskId: "2-2",
    status: "in_progress",
    appliedDate: "2024-02-15",
  },
];

// Mock tasks with full details
export const mockTasks = mockProjects.flatMap(project =>
  project.tasks.map(task => ({
    ...task,
    projectId: project.id,
    reward: {
      amount: task.reward,
      token: "USDT",
    },
  })),
);
