"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { mockProjects, mockTasks, mockUserParticipations, mockUserTasks } from "~~/data/mockData";

const DashboardPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("projects");

  // Get projects the user has participated in
  const userParticipations = mockUserParticipations;
  const participatedProjects = userParticipations.map(participation => {
    const project = mockProjects.find(p => p.id === participation.projectId);
    return { ...participation, project };
  });

  // Get tasks the user has applied for or is working on
  const userTasks = mockUserTasks;
  const userTasksWithDetails = userTasks.map(userTask => {
    const taskDetails = mockTasks.find(t => t.id === userTask.taskId);
    return { ...userTask, task: taskDetails };
  });

  // Calculate total tokens
  const totalTokens = userParticipations.reduce((acc, participation) => acc + participation.tokenAmount, 0);

  // Calculate total unlocked tokens
  const unlockedTokens = userParticipations.reduce((acc, participation) => {
    const unlocked = participation.unlockSchedule
      .filter(schedule => schedule.unlocked)
      .reduce((sum, schedule) => sum + (participation.tokenAmount * schedule.percentage) / 100, 0);
    return acc + unlocked;
  }, 0);

  return (
    <div className="flex flex-col pt-20 min-h-screen sm:pt-24 animate-fade-in">
      {/* SVG Background */}
      <div className="fixed inset-0 z-[-1] opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dashboardGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50,0 L0,0 L0,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="currentColor" />
            </pattern>
            <pattern id="dashboardDots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboardDots)" />
          <rect width="100%" height="100%" fill="url(#dashboardGrid)" />
          <rect width="100%" height="100%" fill="url(#fadeGradient)" />
        </svg>
      </div>

      <div className="container px-4 mx-auto">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl sm:mb-8">Your Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 sm:mb-8">
          <div className="shadow-lg card bg-primary text-primary-content">
            <div className="p-4 card-body sm:p-6">
              <h2 className="text-base card-title sm:text-lg">Projects Backed</h2>
              <p className="text-2xl font-bold sm:text-4xl">{participatedProjects.length}</p>
            </div>
          </div>

          <div className="shadow-lg card bg-secondary text-secondary-content">
            <div className="p-4 card-body sm:p-6">
              <h2 className="text-base card-title sm:text-lg">Tasks Participated</h2>
              <p className="text-2xl font-bold sm:text-4xl">{userTasksWithDetails.length}</p>
            </div>
          </div>

          <div className="shadow-lg card bg-accent text-accent-content sm:col-span-2 md:col-span-1">
            <div className="p-4 card-body sm:p-6">
              <h2 className="text-base card-title sm:text-lg">Token Balance</h2>
              <p className="text-2xl font-bold sm:text-4xl">
                {unlockedTokens.toLocaleString()} / {totalTokens.toLocaleString()}
              </p>
              <p className="text-xs opacity-80 sm:text-sm">Unlocked / Total</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-1 mb-6 rounded-xl tabs tabs-boxed bg-base-200/50 sm:p-2 sm:mb-8">
          <button
            className={`tab text-xs sm:text-sm flex-1 ${activeTab === "projects" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            My Investments
          </button>
          <button
            className={`tab text-xs sm:text-sm flex-1 ${activeTab === "tasks" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            My Tasks
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="shadow-lg card bg-base-100">
              <div className="p-4 card-body sm:p-6">
                <h2 className="mb-4 text-lg card-title sm:text-xl sm:mb-6">My Investments</h2>
                {participatedProjects.length > 0 ? (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="table w-full table-sm sm:table-md">
                      <thead>
                        <tr>
                          <th className="text-xs sm:text-sm">Project</th>
                          <th className="text-xs sm:text-sm">Amount</th>
                          <th className="text-xs sm:text-sm">Tokens</th>
                          <th className="text-xs sm:text-sm">Status</th>
                          <th className="text-xs sm:text-sm">Unlocked</th>
                          <th className="text-xs sm:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participatedProjects.map(investment => (
                          <tr key={investment.projectId}>
                            <td>
                              <div className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                                {investment.project ? investment.project.title : "Unknown Project"}
                              </div>
                            </td>
                            <td className="text-xs sm:text-sm">${investment.investedAmount.toLocaleString()}</td>
                            <td className="text-xs sm:text-sm">{investment.tokenAmount.toLocaleString()}</td>
                            <td>
                              <span
                                className={`badge badge-xs sm:badge-sm ${
                                  investment.status === "active"
                                    ? "badge-success"
                                    : investment.status === "completed"
                                      ? "badge-info"
                                      : "badge-error"
                                }`}
                              >
                                {investment.status}
                              </span>
                            </td>
                            <td className="text-xs sm:text-sm">
                              {(() => {
                                const unlocked = investment.unlockSchedule
                                  .filter(s => s.unlocked)
                                  .reduce((acc, s) => acc + s.percentage, 0);
                                return `${unlocked}%`;
                              })()}
                            </td>
                            <td>
                              <Link
                                href={`/projects/${investment.projectId}`}
                                className="btn btn-xs sm:btn-sm btn-outline"
                              >
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 text-center rounded-lg sm:py-8 bg-base-200/50">
                    <h3 className="mb-2 text-lg font-bold sm:text-xl">No investments yet</h3>
                    <p className="mb-4 text-xs opacity-80 sm:text-sm">You haven&apos;t invested in any projects.</p>
                    <Link href="/projects" className="btn btn-primary btn-sm sm:btn-md">
                      Browse Projects
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Token Unlock Schedule */}
            {participatedProjects.length > 0 && (
              <div className="shadow-lg card bg-base-100">
                <div className="p-4 card-body sm:p-6">
                  <h3 className="mb-4 text-lg card-title sm:text-xl sm:mb-6">Token Release Schedule</h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="table w-full table-sm sm:table-md">
                      <thead>
                        <tr>
                          <th className="text-xs sm:text-sm">Date</th>
                          <th className="text-xs sm:text-sm">Project</th>
                          <th className="text-xs sm:text-sm">Percentage</th>
                          <th className="text-xs sm:text-sm">Tokens</th>
                          <th className="text-xs sm:text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participatedProjects.flatMap(investment =>
                          investment.unlockSchedule.map((schedule, index) => (
                            <tr key={`${investment.projectId}-${index}`}>
                              <td className="text-xs sm:text-sm">{new Date(schedule.date).toLocaleDateString()}</td>
                              <td className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                                {investment.project ? investment.project.title : "Unknown Project"}
                              </td>
                              <td className="text-xs sm:text-sm">{schedule.percentage}%</td>
                              <td className="text-xs sm:text-sm">
                                {Math.round(investment.tokenAmount * (schedule.percentage / 100)).toLocaleString()}
                              </td>
                              <td>
                                {schedule.unlocked ? (
                                  <span className="badge badge-xs sm:badge-sm badge-success">Released</span>
                                ) : (
                                  <span className="badge badge-xs sm:badge-sm badge-outline">Scheduled</span>
                                )}
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="shadow-lg card bg-base-100">
            <div className="p-4 card-body sm:p-6">
              <h2 className="mb-4 text-lg card-title sm:text-xl sm:mb-6">My Tasks</h2>
              {userTasksWithDetails.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="table w-full table-sm sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-xs sm:text-sm">Task</th>
                        <th className="text-xs sm:text-sm">Status</th>
                        <th className="text-xs sm:text-sm">Reward</th>
                        <th className="text-xs sm:text-sm">Applied On</th>
                        <th className="text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTasksWithDetails.map(userTaskWithDetails => (
                        <tr key={userTaskWithDetails.taskId}>
                          <td className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                            <div className="font-medium">
                              {userTaskWithDetails.task ? userTaskWithDetails.task.title : "Unknown Task"}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge badge-xs sm:badge-sm ${
                                userTaskWithDetails.status === "completed"
                                  ? "badge-success"
                                  : userTaskWithDetails.status === "in_progress"
                                    ? "badge-warning"
                                    : "badge-info"
                              }`}
                            >
                              {userTaskWithDetails.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="text-xs sm:text-sm">
                            {userTaskWithDetails.task
                              ? `${userTaskWithDetails.task.reward.amount} ${userTaskWithDetails.task.reward.token}`
                              : "N/A"}
                          </td>
                          <td className="text-xs sm:text-sm">
                            {new Date(userTaskWithDetails.appliedDate).toLocaleDateString()}
                          </td>
                          <td>
                            <Link
                              href={`/tasks/${userTaskWithDetails.taskId}`}
                              className="btn btn-xs sm:btn-sm btn-outline"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center rounded-lg sm:py-8 bg-base-200/50">
                  <h3 className="mb-2 text-lg font-bold sm:text-xl">No tasks yet</h3>
                  <p className="mb-4 text-xs opacity-80 sm:text-sm">You haven&apos;t applied for any tasks.</p>
                  <Link href="/tasks" className="btn btn-primary btn-sm sm:btn-md">
                    Browse Tasks
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
