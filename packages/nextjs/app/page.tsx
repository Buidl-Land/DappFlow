"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { FundingProgress } from "~~/components/crowdfunding/FundingProgress";
import { Address } from "~~/components/scaffold-eth";
import { TaskCard } from "~~/components/tasks/TaskCard";
import { mockProjects, mockTasks } from "~~/data/mockData";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [featuredProjects, setFeaturedProjects] = useState(mockProjects.slice(0, 2));
  const [featuredTasks, setFeaturedTasks] = useState(mockTasks.filter(task => task.status === "open").slice(0, 2));

  // Platform statistics
  const totalProjects = mockProjects.length;
  const totalRaised = mockProjects.reduce((acc, project) => acc + project.raisedAmount, 0);
  const totalParticipants = mockProjects.reduce((acc, project) => acc + project.participants, 0);
  const totalTasks = mockTasks.length;

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Hero Section */}
      <div className="min-h-[60vh] flex flex-col justify-center items-center py-12 text-center">
        <h1 className="mb-4 max-w-4xl text-5xl font-extrabold tracking-tight md:text-6xl">
          IdeaPulse: AI-Powered Web3 Project Incubator
        </h1>
        <p className="mb-8 max-w-2xl text-xl">
          Discover, fund, and contribute to innovative blockchain projects verified by AI
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/crowdfunding" className="btn btn-primary btn-lg">
            Explore Projects
          </Link>
          <Link href="/tasks" className="btn btn-outline btn-lg">
            Find Tasks
          </Link>
        </div>

        {connectedAddress && (
          <div className="flex justify-center items-center my-4 space-x-2">
            <Link href="/dashboard" className="underline link-hover">
              View Your Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Platform Stats */}
      <div className="my-12">
        <h2 className="mb-6 text-3xl font-bold text-center">Platform Overview</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="p-4 text-center rounded-lg bg-base-200">
            <div className="text-3xl font-bold">{totalProjects}</div>
            <div className="mt-1 opacity-70">Projects</div>
          </div>
          <div className="p-4 text-center rounded-lg bg-base-200">
            <div className="text-3xl font-bold">${totalRaised.toLocaleString()}</div>
            <div className="mt-1 opacity-70">Raised</div>
          </div>
          <div className="p-4 text-center rounded-lg bg-base-200">
            <div className="text-3xl font-bold">{totalParticipants}</div>
            <div className="mt-1 opacity-70">Participants</div>
          </div>
          <div className="p-4 text-center rounded-lg bg-base-200">
            <div className="text-3xl font-bold">{totalTasks}</div>
            <div className="mt-1 opacity-70">Tasks</div>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="my-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <Link href="/crowdfunding" className="btn btn-sm btn-outline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featuredProjects.map(project => (
            <div key={project.id} className="shadow-xl card bg-base-100">
              <div className="card-body">
                <h3 className="card-title">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="badge badge-outline badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm">{project.summary}</p>

                <div className="mt-4 mb-2">
                  <FundingProgress
                    raised={project.raisedAmount}
                    goal={project.fundingGoal}
                    participants={project.participants}
                  />
                </div>

                <div className="justify-end card-actions">
                  <Link href={`/crowdfunding/${project.id}`} className="btn btn-primary btn-sm">
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Tasks</h2>
          <Link href="/tasks" className="btn btn-sm btn-outline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featuredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="my-16">
        <h2 className="mb-8 text-3xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* For Investors */}
          <div className="p-6 text-center rounded-lg bg-base-200">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">For Investors</h3>
            <ol className="space-y-2 text-lg text-left">
              <li>1. Browse AI-vetted projects</li>
              <li>2. Review risk assessments</li>
              <li>3. Invest with your preferred token</li>
              <li>4. Receive project tokens with release schedule</li>
            </ol>
          </div>

          {/* For Contributors */}
          <div className="p-6 text-center rounded-lg bg-base-200">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">For Contributors</h3>
            <ol className="space-y-2 text-lg text-left">
              <li>1. Find tasks matching your skills</li>
              <li>2. Apply to tasks you&apos;re interested in</li>
              <li>3. Complete task requirements</li>
              <li>4. Submit work and earn rewards</li>
            </ol>
          </div>

          {/* For Project Owners */}
          <div className="p-6 text-center rounded-lg bg-base-200">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">For Project Owners</h3>
            <ol className="space-y-2 text-lg text-left">
              <li>1. Submit your project for AI assessment</li>
              <li>2. Receive detailed feedback and valuation</li>
              <li>3. Launch crowdfunding campaign</li>
              <li>4. Create tasks to build your project</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Connect Wallet CTA */}
      {!connectedAddress && (
        <div className="p-8 my-12 text-center rounded-lg bg-primary text-primary-content">
          <h2 className="mb-4 text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mb-6 text-lg">Connect your wallet to invest in projects or contribute to tasks.</p>

          <div className="flex justify-center">
            {/* This button is just for show - actual connection is handled by RainbowKit */}
            <button className="btn btn-lg btn-secondary">Connect Wallet</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
