"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectCard } from "~~/components/shared/ProjectCard";
import { mockProjects } from "~~/data/mockData";

type ProjectFilter = "all" | "funding" | "tasks";
type ProjectStatus = "all" | "active" | "completed";

const ProjectsPage = () => {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<ProjectFilter>((searchParams.get("filter") as ProjectFilter) || "all");
  const [status, setStatus] = useState<ProjectStatus>((searchParams.get("status") as ProjectStatus) || "all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const filteredProjects = mockProjects.filter(project => {
    // Filter by type (funding/tasks)
    if (filter === "funding" && project.raisedAmount >= project.fundingGoal) return false;
    if (filter === "tasks" && project.tasks.every(task => task.status === "completed")) return false;

    // Filter by status
    if (status === "completed") {
      if (project.status !== "completed") return false;
    } else if (status === "active") {
      if (project.status !== "active") return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.title.toLowerCase().includes(searchLower) || project.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col pt-24 min-h-screen animate-fade-in">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-b to-transparent from-base-200/50">
        <div className="px-4 py-12 mx-auto max-w-7xl">
          <h1 className="mb-6 text-4xl font-bold animate-slide-up">
            Explore <span className="text-primary">Projects</span>
          </h1>
          <p className="mb-8 max-w-3xl text-lg opacity-80 delay-100 animate-slide-up">
            Discover innovative blockchain projects and contribute through funding or tasks.
          </p>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8 delay-200 sm:flex-row animate-slide-up">
            {/* Filter Group */}
            <div className="rounded-lg shadow-md join bg-base-100">
              <button
                className={`btn join-item ${filter === "all" ? "btn-primary" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Projects
              </button>
              <button
                className={`btn join-item ${filter === "funding" ? "btn-primary" : ""}`}
                onClick={() => setFilter("funding")}
              >
                Funding Open
              </button>
              <button
                className={`btn join-item ${filter === "tasks" ? "btn-primary" : ""}`}
                onClick={() => setFilter("tasks")}
              >
                Tasks Available
              </button>
            </div>

            {/* Status Group */}
            <div className="rounded-lg shadow-md join bg-base-100">
              <button
                className={`btn join-item ${status === "all" ? "btn-secondary" : ""}`}
                onClick={() => setStatus("all")}
              >
                All Status
              </button>
              <button
                className={`btn join-item ${status === "active" ? "btn-secondary" : ""}`}
                onClick={() => setStatus("active")}
              >
                Active
              </button>
              <button
                className={`btn join-item ${status === "completed" ? "btn-secondary" : ""}`}
                onClick={() => setStatus("completed")}
              >
                Completed
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full shadow-md input input-bordered bg-base-100 sm:max-w-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="px-4 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <div key={project.id} className={`animate-scale-up delay-${(index % 3) * 100}`}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-16 text-center shadow-lg card bg-base-100">
            <p className="text-lg opacity-60">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
