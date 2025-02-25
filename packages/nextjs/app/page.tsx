"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { FundingProgress } from "~~/components/crowdfunding/FundingProgress";
import InnovationIllustration from "~~/components/illustrations/InnovationIllustration";
import NetworkIllustration from "~~/components/illustrations/NetworkIllustration";
import FlowIcon from "~~/components/networks/FlowIcon";
import MonadIcon from "~~/components/networks/MonadIcon";
import { TaskCard } from "~~/components/tasks/TaskCard";
import { mockProjects, mockTasks } from "~~/data/mockData";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [featuredProjects, setFeaturedProjects] = useState(mockProjects.slice(0, 2));
  const [featuredTasks, setFeaturedTasks] = useState(mockTasks.filter(task => task.status === "open").slice(0, 2));

  const totalProjects = mockProjects.length;
  const totalRaised = mockProjects.reduce((acc, project) => acc + project.raisedAmount, 0);
  const totalParticipants = mockProjects.reduce((acc, project) => acc + project.participants, 0);
  const totalTasks = mockTasks.length;

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex flex-col justify-center items-center py-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-10 decoration-dots" />
          <div className="absolute inset-0 opacity-5 decoration-grid" />
        </div>

        <div className="relative z-10 mb-8">
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight md:text-7xl gradient-text-primary">Idea Pulse</h1>
          <p className="mb-4 text-2xl font-bold gradient-text-secondary">
            Build with AI, Grow with Community, Tokenize with DAO
          </p>
        </div>

        <div className="relative z-10 mb-12 w-full max-w-2xl">
          <InnovationIllustration className="mx-auto mb-8 w-64 h-64" />
          <p className="text-xl text-content-secondary">
            A decentralized innovation incubator where AI and community DAO governance unite to transform ideas into
            successful Web3 projects
          </p>
        </div>

        <div className="flex relative z-10 flex-wrap gap-4 justify-center mb-8">
          <Link href="/crowdfunding" className="btn btn-gradient">
            Explore Projects
          </Link>
          <Link href="/tasks" className="btn btn-outline-glow">
            Find Tasks
          </Link>
        </div>

        {/* Network Support */}
        <div className="flex relative z-10 flex-wrap gap-4 justify-center items-center mt-8">
          <div className="network-badge monad">
            <MonadIcon className="w-5 h-5" />
            Monad Testnet
          </div>
          <div className="network-badge flow">
            <FlowIcon className="w-5 h-5" />
            Flow EVM
          </div>
        </div>

        {connectedAddress && (
          <div className="relative z-10 mt-8">
            <Link href="/dashboard" className="underline text-content-primary hover:text-content-secondary">
              View Your Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Platform Stats */}
      <div className="my-16">
        <h2 className="mb-8 text-3xl font-bold text-center text-content-primary">Platform Overview</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: totalProjects, label: "Projects" },
            { value: `$${totalRaised.toLocaleString()}`, label: "Raised" },
            { value: totalParticipants, label: "Participants" },
            { value: totalTasks, label: "Tasks" },
          ].map((stat, i) => (
            <div key={i} className="p-6 text-center card card-hover">
              <div className="text-3xl font-bold gradient-text-primary">{stat.value}</div>
              <div className="mt-2 text-content-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Visualization */}
      <div className="my-16">
        <NetworkIllustration className="mx-auto w-full max-w-3xl" />
      </div>

      {/* Core Features */}
      <div className="my-16">
        <h2 className="mb-12 text-3xl font-bold text-center text-content-primary">Core Features</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: "AI-Powered Innovation",
              description:
                "Submit ideas through social platforms and receive AI-generated structured proposals with technical roadmaps and budgets",
            },
            {
              title: "Dynamic Token System",
              description:
                "Stake tokens to participate in development, earn rewards through task completion and community voting",
            },
            {
              title: "Decentralized Governance",
              description: "Community-driven decision making with transparent voting and milestone tracking",
            },
          ].map((feature, i) => (
            <div key={i} className="p-6 card card-hover">
              <h3 className="mb-4 text-xl font-bold gradient-text-primary">{feature.title}</h3>
              <p className="text-content-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects */}
      <div className="my-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-content-primary">Featured Projects</h2>
          <Link href="/crowdfunding" className="btn btn-outline-glow btn-sm">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featuredProjects.map(project => (
            <div key={project.id} className="card card-hover">
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-content-primary">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-sm network-badge monad">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-content-secondary">{project.summary}</p>

                <div className="mt-4 mb-2">
                  <FundingProgress
                    raised={project.raisedAmount}
                    goal={project.fundingGoal}
                    participants={project.participants}
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Link href={`/crowdfunding/${project.id}`} className="btn btn-gradient btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Tasks */}
      <div className="my-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-content-primary">Featured Tasks</h2>
          <Link href="/tasks" className="btn btn-outline-glow btn-sm">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featuredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Join The Community CTA */}
      {!connectedAddress && (
        <div className="overflow-hidden relative p-12 my-16 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F2FF] to-[#1E90FF] opacity-10" />
          <div className="absolute inset-0 opacity-5 decoration-dots" />

          <div className="relative z-10 text-center">
            <h2 className="mb-4 text-3xl font-bold gradient-text-primary">Join The Innovation Community</h2>
            <p className="mb-8 text-xl text-content-secondary">
              Connect your wallet to start building the future of Web3
            </p>

            <button className="btn btn-gradient btn-lg">Connect Wallet</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
