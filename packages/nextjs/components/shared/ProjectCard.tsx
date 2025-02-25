"use client";

import Link from "next/link";
import { TaskStatus } from "~~/data/mockData";

interface Task {
  id: string;
  title: string;
  reward: number;
  status: TaskStatus;
}

interface Project {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  raisedAmount: number;
  endDate: string;
  creator: string;
  tasks: Task[];
}

export const ProjectCard = ({ project }: { project: Project }) => {
  const progress = (project.raisedAmount / project.fundingGoal) * 100;
  const openTasks = project.tasks.filter(task => task.status === "open").length;
  const totalTasks = project.tasks.length;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
  );

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-base-100 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-base-300"
    >
      {/* Project Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3 text-primary">{project.title}</h3>
        <p className="text-sm opacity-70 line-clamp-2">{project.description}</p>
      </div>

      {/* Funding Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">
            {project.raisedAmount.toLocaleString()} / {project.fundingGoal.toLocaleString()} USDT
          </span>
          <span className="opacity-70">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-base-200 rounded-full h-2.5">
          <div
            className="bg-primary rounded-full h-2.5 transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-3 gap-4 text-center py-4 mb-6 border-y border-base-200">
        <div>
          <div className="text-lg font-bold text-secondary">{daysLeft}</div>
          <div className="text-xs opacity-70">Days Left</div>
        </div>
        <div>
          <div className="text-lg font-bold text-accent">{openTasks}</div>
          <div className="text-xs opacity-70">Open Tasks</div>
        </div>
        <div>
          <div className="text-lg font-bold">{totalTasks}</div>
          <div className="text-xs opacity-70">Total Tasks</div>
        </div>
      </div>

      {/* Project Footer */}
      <div className="flex justify-between items-center text-xs">
        <span className="opacity-70">
          By {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
        </span>
        <div className="flex items-center gap-2">
          {openTasks > 0 && (
            <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-full font-medium">Tasks Available</span>
          )}
          {progress < 100 && (
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">Funding Open</span>
          )}
        </div>
      </div>
    </Link>
  );
};
