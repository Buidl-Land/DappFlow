"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { ProjectCard } from "~~/components/crowdfunding/ProjectCard";
import { mockProjects } from "~~/data/mockData";

const CrowdfundingPage: NextPage = () => {
  const [filter, setFilter] = useState("all");

  const filteredProjects = mockProjects.filter(project => {
    if (filter === "all") return true;
    return project.tags.includes(filter);
  });

  // Extract unique tags for filtering
  const uniqueTags = Array.from(new Set(mockProjects.flatMap(project => project.tags)));

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Crowdfunding Platform</h1>
        <p className="mx-auto max-w-2xl text-lg opacity-80">
          Discover and support innovative blockchain projects, evaluated by AI for risk and potential.
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="mb-8 w-full shadow stats">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Active Projects</div>
          <div className="stat-value">{mockProjects.length}</div>
          <div className="stat-desc">Projects open for funding</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Total Raised</div>
          <div className="stat-value">
            ${mockProjects.reduce((acc, project) => acc + project.raisedAmount, 0).toLocaleString()}
          </div>
          <div className="stat-desc">Across all projects</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Participants</div>
          <div className="stat-value">{mockProjects.reduce((acc, project) => acc + project.participants, 0)}</div>
          <div className="stat-desc">Unique backers</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilter("all")}
        >
          All Projects
        </button>
        {uniqueTags.map(tag => (
          <button
            key={tag}
            className={`btn btn-sm ${filter === tag ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="py-12 text-center">
          <h3 className="text-xl font-bold">No projects found</h3>
          <p>There are no projects matching the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default CrowdfundingPage;
