"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { IdeaPulseLogo } from "~~/components/assets/IdeaPulseLogo";
import { ProjectCard } from "~~/components/shared/ProjectCard";
import { mockProjects } from "~~/data/mockData";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [featuredProjects] = useState(mockProjects.slice(0, 2));

  const totalProjects = mockProjects.length;
  const totalRaised = mockProjects.reduce((acc, project) => acc + project.raisedAmount, 0);
  const totalOpenTasks = mockProjects.reduce(
    (acc, project) => acc + project.tasks.filter(task => task.status === "open").length,
    0,
  );

  return (
    <div className="flex flex-col items-center min-h-screen pt-20">
      {/* Hero Section */}
      <section className="w-full px-4 py-20 bg-gradient-to-b from-base-200/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-12 animate-bounce-soft">
              <IdeaPulseLogo className="w-32 h-32 mx-auto" />
            </div>
            <h1 className="text-6xl font-bold mb-8 animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Web3 Innovation Hub
            </h1>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-80 animate-slide-up delay-200 leading-relaxed">
              Discover groundbreaking blockchain projects, contribute through funding or tasks, and be part of the
              future of decentralized innovation.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow animate-scale-up delay-300">
                <div className="card-body">
                  <div className="stat px-0">
                    <div className="stat-title opacity-60">Total Projects</div>
                    <div className="stat-value text-primary">{totalProjects}</div>
                    <div className="stat-desc">Active innovations</div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow animate-scale-up delay-400">
                <div className="card-body">
                  <div className="stat px-0">
                    <div className="stat-title opacity-60">Total Raised</div>
                    <div className="stat-value text-secondary">${totalRaised.toLocaleString()}</div>
                    <div className="stat-desc">In USDT</div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow animate-scale-up delay-500">
                <div className="card-body">
                  <div className="stat px-0">
                    <div className="stat-title opacity-60">Open Tasks</div>
                    <div className="stat-value text-accent">{totalOpenTasks}</div>
                    <div className="stat-desc">Available opportunities</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 justify-center animate-slide-up delay-600">
              <Link
                href="/projects"
                className="btn btn-primary btn-lg font-semibold rounded-full px-12 hover:scale-105 transition-transform"
              >
                Explore Projects
              </Link>
              {!connectedAddress && (
                <button className="btn btn-outline btn-lg font-semibold rounded-full px-12 hover:scale-105 transition-transform">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="w-full py-24 bg-gradient-to-b from-base-200/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 animate-slide-up">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {featuredProjects.map((project, index) => (
              <div key={project.id} className={`animate-slide-up delay-${(index + 1) * 200}`}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
          <div className="text-center animate-slide-up delay-600">
            <Link
              href="/projects"
              className="btn btn-outline btn-lg rounded-full px-12 hover:scale-105 transition-transform"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 animate-slide-up">
            How It <span className="text-primary">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center animate-slide-right">
              <div className="card-body p-12">
                <div className="mb-8 text-5xl">💰</div>
                <h3 className="text-2xl font-bold mb-4">Support Through Funding</h3>
                <p className="opacity-80 leading-relaxed">
                  Back innovative projects with USDT contributions. Get involved early in promising ventures and receive
                  project tokens as rewards.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center animate-slide-left">
              <div className="card-body p-12">
                <div className="mb-8 text-5xl">⚡</div>
                <h3 className="text-2xl font-bold mb-4">Contribute Through Tasks</h3>
                <p className="opacity-80 leading-relaxed">
                  Apply your skills to specific project tasks. Complete work and earn USDT rewards while helping
                  projects succeed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
