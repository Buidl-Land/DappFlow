"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContractProjectCard } from "~~/components/shared/ContractProjectCard";

type ProjectFilter = "all" | "funding" | "tasks";
type ProjectStatus = "all" | "active" | "completed";

const ProjectsContent = () => {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<ProjectFilter>((searchParams.get("filter") as ProjectFilter) || "all");
  const [status, setStatus] = useState<ProjectStatus>((searchParams.get("status") as ProjectStatus) || "all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Create an array of project IDs for rendering ContractProjectCard
  const projectIds = [1, 2, 3];

  return (
    <div className="flex flex-col pt-16 min-h-screen animate-fade-in">
      {/* SVG Background */}
      <div className="fixed inset-0 z-[-1] opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M0,0 L40,0 L40,40 L0,40 L0,0 Z M39,1 L1,1 L1,39 L39,39 L39,1 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            </pattern>
            <mask id="gridMask">
              <rect width="100%" height="100%" fill="url(#grid)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <rect width="100%" height="100%" fill="currentColor" mask="url(#gridMask)" opacity="0.2" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="w-full bg-gradient-to-b to-transparent from-base-200/50 mt-0">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:py-12">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl"></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-24 w-72 h-72 rounded-full bg-gradient-to-tr from-accent/30 to-primary/30 blur-xl animate-pulse"></div>

            <h1 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-5xl animate-slide-up relative z-10">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-extrabold">
                BuidlLand
              </span>
              <span className="block sm:inline"> Ecosystem</span>
            </h1>

            <div className="relative mb-8 max-w-3xl">
              <p className="text-base sm:text-xl leading-relaxed opacity-90 delay-100 animate-slide-up">
                <span className="font-semibold">Where AI and community unite</span> to transform innovative ideas into
                <span className="relative inline-block mx-1">
                  <span className="relative z-10">Web3 realities</span>
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-accent/30 -rotate-1"></span>
                </span>
                through transparent funding and collaborative development.
                <span className="block mt-2">
                  Powered by intelligent <span className="text-secondary font-medium">AI Agents</span> that help curate
                  ideas, generate structured proposals, and facilitate community-driven governance for a truly
                  decentralized innovation ecosystem.
                </span>
                <span className="block mt-2 text-sm sm:text-base italic opacity-80">
                  Breaking traditional VC monopolies through community-powered token economics and AI-assisted project
                  development — where every contributor is rewarded fairly based on their value creation.
                </span>
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row w-full gap-3 mb-2 delay-200 sm:gap-4 sm:mb-4 animate-slide-up">
            {/* Filter Group */}
            <div className="w-full sm:w-2/5 rounded-lg shadow-md join bg-base-100">
              <button
                className={`flex-1 btn join-item btn-sm sm:btn-md hover:bg-primary/30 ${
                  filter === "all" ? "bg-primary/20 text-primary font-semibold" : ""
                }`}
                onClick={() => setFilter("all")}
              >
                All Projects
              </button>
              <button
                className={`flex-1 btn join-item btn-sm sm:btn-md hover:bg-primary/30 ${
                  filter === "funding" ? "bg-primary/20 text-primary font-semibold" : ""
                }`}
                onClick={() => setFilter("funding")}
              >
                Funding Open
              </button>
              <button
                className={`flex-1 btn join-item btn-sm sm:btn-md hover:bg-primary/30 ${
                  filter === "tasks" ? "bg-primary/20 text-primary font-semibold" : ""
                }`}
                onClick={() => setFilter("tasks")}
              >
                Tasks Available
              </button>
            </div>

            {/* Status Group */}
            <div className="w-full sm:w-1/3 rounded-lg shadow-md join bg-base-100">
              <button
                className={`flex-1 btn join-item btn-sm sm:btn-md hover:bg-accent/30 ${
                  status === "all" ? "bg-accent/20 text-accent font-semibold" : ""
                }`}
                onClick={() => setStatus("all")}
              >
                All Status
              </button>
              <button
                className={`flex-1 btn join-item btn-sm sm:btn-md hover:bg-accent/30 ${
                  status === "active" ? "bg-accent/20 text-accent font-semibold" : ""
                }`}
                onClick={() => setStatus("active")}
              >
                Active
              </button>
              <button
                className={`flex-1 btn join-item btn-sm sm:btn-md hover:bg-accent/30 ${
                  status === "completed" ? "bg-accent/20 text-accent font-semibold" : ""
                }`}
                onClick={() => setStatus("completed")}
              >
                Completed
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full sm:w-1/4 shadow-md input input-sm sm:input-md input-bordered bg-base-100 focus:border-primary/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="px-4 pt-0 pb-8 mx-auto max-w-7xl sm:pb-12">
        <div className="flex flex-wrap gap-6 md:gap-4 lg:gap-6">
          {projectIds.map((projectId) => (
            <ContractProjectCard key={projectId} projectId={projectId} />
          ))}
        </div>

        {projectIds.length === 0 && (
          <div className="py-12 text-center shadow-lg sm:py-16 card bg-base-100">
            <p className="text-lg opacity-60">No projects found matching your criteria.</p>
            <button
              className="mx-auto mt-4 btn btn-primary btn-sm"
              onClick={() => {
                setFilter("all");
                setStatus("all");
                setSearchTerm("");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
};

export default ProjectsPage;
