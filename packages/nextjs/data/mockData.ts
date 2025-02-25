export type Project = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  aiAssessment: {
    riskScore: number;
    technicalFeasibility: number;
    valuationRange: {
      min: number;
      max: number;
    };
  };
  fundingGoal: number;
  raisedAmount: number;
  participants: number;
  startDate: string;
  endDate: string;
  description: string;
  fundAllocation: {
    development: number;
    operations: number;
    community: number;
  };
  tokenDistribution: {
    crowdfunding: number;
    team: number;
    ecosystem: number;
  };
  roadmap: Array<{
    phase: string;
    description: string;
    timeline: string;
    completed: boolean;
  }>;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  category: "development" | "design" | "marketing";
  difficulty: "easy" | "medium" | "hard";
  reward: {
    amount: number;
    token: string;
  };
  deadline: string;
  status: "open" | "assigned" | "in_progress" | "completed" | "verified";
  requirements: {
    skills: string[];
    experienceLevel: string;
  };
  timeline: {
    createdAt: string;
    estimatedHours: number;
  };
  assignedTo?: string;
};

export type UserParticipation = {
  projectId: string;
  investedAmount: number;
  tokenAmount: number;
  status: "active" | "completed" | "failed";
  unlockSchedule: Array<{
    date: string;
    percentage: number;
    unlocked: boolean;
  }>;
};

export type UserTask = {
  taskId: string;
  status: "applied" | "in_progress" | "submitted" | "completed";
  appliedDate: string;
  completedDate?: string;
};

// Mock data for projects
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "DeFi Lending Protocol",
    summary: "Next-generation lending platform with dynamic interest rates",
    tags: ["DeFi", "Lending", "Yield"],
    aiAssessment: {
      riskScore: 65,
      technicalFeasibility: 85,
      valuationRange: {
        min: 5000000,
        max: 8000000,
      },
    },
    fundingGoal: 500000,
    raisedAmount: 325000,
    participants: 128,
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    description:
      "Our DeFi lending protocol introduces innovative risk assessment algorithms that dynamically adjust interest rates based on market conditions. The platform supports multiple assets and includes a governance token for community-driven decision making.",
    fundAllocation: {
      development: 70,
      operations: 20,
      community: 10,
    },
    tokenDistribution: {
      crowdfunding: 60,
      team: 25,
      ecosystem: 15,
    },
    roadmap: [
      {
        phase: "Phase 1: MVP",
        description: "Launch basic lending functionality with 3 major assets",
        timeline: "Q1 2025",
        completed: true,
      },
      {
        phase: "Phase 2: Advanced Features",
        description: "Implement risk assessment algorithm and yield optimizers",
        timeline: "Q2 2025",
        completed: false,
      },
      {
        phase: "Phase 3: Governance",
        description: "Launch governance token and community voting system",
        timeline: "Q3 2025",
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "NFT Marketplace",
    summary: "Multi-chain NFT platform with creator royalties and fractionalization",
    tags: ["NFT", "Marketplace", "Multi-Chain"],
    aiAssessment: {
      riskScore: 45,
      technicalFeasibility: 90,
      valuationRange: {
        min: 3000000,
        max: 7000000,
      },
    },
    fundingGoal: 350000,
    raisedAmount: 175000,
    participants: 82,
    startDate: "2025-02-01",
    endDate: "2025-04-01",
    description:
      "Our NFT marketplace enables artists and creators to mint and trade NFTs across multiple blockchains. The platform features automatic royalty distribution, fractionalized ownership, and advanced curation mechanisms.",
    fundAllocation: {
      development: 65,
      operations: 25,
      community: 10,
    },
    tokenDistribution: {
      crowdfunding: 55,
      team: 30,
      ecosystem: 15,
    },
    roadmap: [
      {
        phase: "Phase 1: Core Platform",
        description: "Launch marketplace with basic buying and selling features",
        timeline: "Q1 2025",
        completed: true,
      },
      {
        phase: "Phase 2: Multi-chain Support",
        description: "Add support for Ethereum, Polygon, and Solana",
        timeline: "Q2 2025",
        completed: false,
      },
      {
        phase: "Phase 3: Advanced Features",
        description: "Implement fractionalization and NFT-Fi lending",
        timeline: "Q3 2025",
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "Decentralized Identity Solution",
    summary: "Self-sovereign identity platform with zero-knowledge proofs",
    tags: ["Identity", "Privacy", "ZK-proofs"],
    aiAssessment: {
      riskScore: 75,
      technicalFeasibility: 70,
      valuationRange: {
        min: 4000000,
        max: 9000000,
      },
    },
    fundingGoal: 600000,
    raisedAmount: 150000,
    participants: 43,
    startDate: "2025-02-10",
    endDate: "2025-04-10",
    description:
      "Our decentralized identity solution uses zero-knowledge proofs to enable secure, private identity verification without revealing personal data. The platform integrates with existing web2 services while maintaining full user control over data.",
    fundAllocation: {
      development: 75,
      operations: 15,
      community: 10,
    },
    tokenDistribution: {
      crowdfunding: 60,
      team: 25,
      ecosystem: 15,
    },
    roadmap: [
      {
        phase: "Phase 1: Core Protocol",
        description: "Develop core identity registration and verification protocol",
        timeline: "Q1 2025",
        completed: true,
      },
      {
        phase: "Phase 2: ZK Integration",
        description: "Implement zero-knowledge proof system for private verification",
        timeline: "Q2 2025",
        completed: false,
      },
      {
        phase: "Phase 3: Web2 Integrations",
        description: "Launch plugins for major web2 services and social platforms",
        timeline: "Q4 2025",
        completed: false,
      },
    ],
  },
];

// Mock data for tasks
export const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Frontend Development - Project Listing Page",
    description:
      "Implement a responsive project listing page with filtering and sorting functionality. The page should display project cards with key information and support mobile and desktop views.",
    category: "development",
    difficulty: "medium",
    reward: {
      amount: 500,
      token: "MON",
    },
    deadline: "2025-03-20",
    status: "open",
    requirements: {
      skills: ["React", "TypeScript", "Tailwind CSS"],
      experienceLevel: "Intermediate",
    },
    timeline: {
      createdAt: "2025-02-15",
      estimatedHours: 40,
    },
  },
  {
    id: "task2",
    title: "Design UI/UX for Dashboard",
    description:
      "Create a modern, intuitive UI/UX design for the participant dashboard. Include mockups for portfolio view, project tracking, and token release schedule visualization.",
    category: "design",
    difficulty: "hard",
    reward: {
      amount: 800,
      token: "MON",
    },
    deadline: "2025-03-15",
    status: "assigned",
    requirements: {
      skills: ["Figma", "UI/UX", "Web3 Design"],
      experienceLevel: "Advanced",
    },
    timeline: {
      createdAt: "2025-02-10",
      estimatedHours: 60,
    },
    assignedTo: "designer1",
  },
  {
    id: "task3",
    title: "Social Media Campaign for Platform Launch",
    description:
      "Plan and execute a comprehensive social media campaign to promote the platform launch. Create content for Twitter, Discord, and Medium focused on the key features and benefits.",
    category: "marketing",
    difficulty: "medium",
    reward: {
      amount: 600,
      token: "MON",
    },
    deadline: "2025-04-05",
    status: "in_progress",
    requirements: {
      skills: ["Social Media Marketing", "Content Creation", "Community Management"],
      experienceLevel: "Intermediate",
    },
    timeline: {
      createdAt: "2025-02-20",
      estimatedHours: 50,
    },
    assignedTo: "marketer1",
  },
  {
    id: "task4",
    title: "Smart Contract Integration - Wallet Connect",
    description:
      "Implement wallet connection functionality with support for MetaMask, WalletConnect, and Coinbase Wallet. Ensure proper error handling and connection state management.",
    category: "development",
    difficulty: "hard",
    reward: {
      amount: 750,
      token: "MON",
    },
    deadline: "2025-03-25",
    status: "open",
    requirements: {
      skills: ["TypeScript", "ethers.js", "Web3Modal"],
      experienceLevel: "Advanced",
    },
    timeline: {
      createdAt: "2025-02-18",
      estimatedHours: 45,
    },
  },
  {
    id: "task5",
    title: "Documentation - User Guide",
    description:
      "Create comprehensive user documentation explaining how to use the platform. Include step-by-step guides for project participation, task submission, and wallet integration.",
    category: "development",
    difficulty: "easy",
    reward: {
      amount: 350,
      token: "MON",
    },
    deadline: "2025-04-10",
    status: "open",
    requirements: {
      skills: ["Technical Writing", "Documentation", "Markdown"],
      experienceLevel: "Beginner",
    },
    timeline: {
      createdAt: "2025-02-25",
      estimatedHours: 30,
    },
  },
];

// Mock user participation data
export const mockUserParticipations: UserParticipation[] = [
  {
    projectId: "1",
    investedAmount: 5000,
    tokenAmount: 50000,
    status: "active",
    unlockSchedule: [
      {
        date: "2025-03-20",
        percentage: 40,
        unlocked: true,
      },
      {
        date: "2025-04-20",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-05-20",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-06-20",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-07-20",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-08-20",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-09-20",
        percentage: 10,
        unlocked: false,
      },
    ],
  },
  {
    projectId: "2",
    investedAmount: 2500,
    tokenAmount: 25000,
    status: "active",
    unlockSchedule: [
      {
        date: "2025-04-05",
        percentage: 40,
        unlocked: false,
      },
      {
        date: "2025-05-05",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-06-05",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-07-05",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-08-05",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-09-05",
        percentage: 10,
        unlocked: false,
      },
      {
        date: "2025-10-05",
        percentage: 10,
        unlocked: false,
      },
    ],
  },
];

// Mock user tasks
export const mockUserTasks: UserTask[] = [
  {
    taskId: "task1",
    status: "applied",
    appliedDate: "2025-02-16",
  },
  {
    taskId: "task4",
    status: "in_progress",
    appliedDate: "2025-02-19",
  },
  {
    taskId: "task5",
    status: "completed",
    appliedDate: "2025-02-26",
    completedDate: "2025-03-05",
  },
];
