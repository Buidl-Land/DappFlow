"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { TaskCard } from "~~/components/tasks/TaskCard";
import { mockTasks } from "~~/data/mockData";

const TasksPage: NextPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTasks = mockTasks.filter(task => {
    return (
      (categoryFilter === "all" || task.category === categoryFilter) &&
      (difficultyFilter === "all" || task.difficulty === difficultyFilter) &&
      (statusFilter === "all" || task.status === statusFilter)
    );
  });

  // Get unique categories
  const categories = Array.from(new Set(mockTasks.map(task => task.category)));

  // Get unique difficulty levels
  const difficulties = Array.from(new Set(mockTasks.map(task => task.difficulty)));

  // Get unique statuses
  const statuses = Array.from(new Set(mockTasks.map(task => task.status)));

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Task Platform</h1>
        <p className="mx-auto max-w-2xl text-lg opacity-80">
          Browse and apply for tasks to contribute to projects and earn rewards.
        </p>
      </div>

      {/* Dashboard Stats */}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Available Tasks</div>
          <div className="stat-value">{mockTasks.filter(t => t.status === "open").length}</div>
          <div className="stat-desc">Tasks open for applications</div>
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
          <div className="stat-title">In Progress</div>
          <div className="stat-value">{mockTasks.filter(t => t.status === "in_progress").length}</div>
          <div className="stat-desc">Tasks currently in progress</div>
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
          <div className="stat-title">Total Rewards</div>
          <div className="stat-value">
            {mockTasks.reduce((acc, task) => acc + task.reward.amount, 0).toLocaleString()} MON
          </div>
          <div className="stat-desc">Available for completion</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="p-4 mb-6 rounded-lg bg-base-200">
        <h2 className="mb-4 text-lg font-bold">Filter Tasks</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Category Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium">Category</label>
            <select
              className="w-full select select-bordered"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              aria-label="Filter tasks by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium">Difficulty</label>
            <select
              className="w-full select select-bordered"
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              aria-label="Filter tasks by difficulty"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium">Status</label>
            <select
              className="w-full select select-bordered"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter tasks by status"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ").charAt(0).toUpperCase() + status.replace(/_/g, " ").slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="py-12 text-center">
          <h3 className="text-xl font-bold">No tasks found</h3>
          <p>There are no tasks matching the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
