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
    <div className="flex flex-col min-h-screen pt-24 animate-fade-in">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-primary text-primary-content shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Projects Backed</h2>
              <p className="text-4xl font-bold">{participatedProjects.length}</p>
            </div>
          </div>

          <div className="card bg-secondary text-secondary-content shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Tasks Participated</h2>
              <p className="text-4xl font-bold">{userTasksWithDetails.length}</p>
            </div>
          </div>

          <div className="card bg-accent text-accent-content shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Token Balance</h2>
              <p className="text-4xl font-bold">
                {unlockedTokens.toLocaleString()} / {totalTokens.toLocaleString()}
              </p>
              <p className="text-sm opacity-80">Unlocked / Total</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200/50 p-2 rounded-xl mb-8">
          <button
            className={`tab flex-1 ${activeTab === "projects" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            My Investments
          </button>
          <button
            className={`tab flex-1 ${activeTab === "tasks" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            My Tasks
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-6">My Investments</h2>
                {participatedProjects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Amount Invested</th>
                          <th>Tokens</th>
                          <th>Status</th>
                          <th>Unlocked</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participatedProjects.map(investment => (
                          <tr key={investment.projectId}>
                            <td>
                              <div className="font-medium">
                                {investment.project ? investment.project.title : "Unknown Project"}
                              </div>
                            </td>
                            <td>${investment.investedAmount.toLocaleString()}</td>
                            <td>{investment.tokenAmount.toLocaleString()}</td>
                            <td>
                              <span
                                className={`badge ${
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
                            <td>
                              {(() => {
                                const unlocked = investment.unlockSchedule
                                  .filter(s => s.unlocked)
                                  .reduce((acc, s) => acc + s.percentage, 0);
                                return `${unlocked}%`;
                              })()}
                            </td>
                            <td>
                              <Link href={`/projects/${investment.projectId}`} className="btn btn-sm btn-outline">
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-base-200/50 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">No investments yet</h3>
                    <p className="mb-4 opacity-80">You haven&apos;t invested in any projects.</p>
                    <Link href="/projects" className="btn btn-primary">
                      Browse Projects
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Token Unlock Schedule */}
            {participatedProjects.length > 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title mb-6">Token Release Schedule</h3>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Project</th>
                          <th>Percentage</th>
                          <th>Tokens</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participatedProjects.flatMap(investment =>
                          investment.unlockSchedule.map((schedule, index) => (
                            <tr key={`${investment.projectId}-${index}`}>
                              <td>{new Date(schedule.date).toLocaleDateString()}</td>
                              <td>{investment.project ? investment.project.title : "Unknown Project"}</td>
                              <td>{schedule.percentage}%</td>
                              <td>
                                {Math.round(investment.tokenAmount * (schedule.percentage / 100)).toLocaleString()}
                              </td>
                              <td>
                                {schedule.unlocked ? (
                                  <span className="badge badge-success">Released</span>
                                ) : (
                                  <span className="badge badge-outline">Scheduled</span>
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
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-6">My Tasks</h2>
              {userTasksWithDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Reward</th>
                        <th>Applied On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTasksWithDetails.map(userTaskWithDetails => (
                        <tr key={userTaskWithDetails.taskId}>
                          <td>
                            <div className="font-medium">
                              {userTaskWithDetails.task ? userTaskWithDetails.task.title : "Unknown Task"}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
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
                          <td>
                            {userTaskWithDetails.task
                              ? `${userTaskWithDetails.task.reward.amount} ${userTaskWithDetails.task.reward.token}`
                              : "N/A"}
                          </td>
                          <td>{new Date(userTaskWithDetails.appliedDate).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/tasks/${userTaskWithDetails.taskId}`} className="btn btn-sm btn-outline">
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-base-200/50 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">No tasks yet</h3>
                  <p className="mb-4 opacity-80">You haven&apos;t applied for any tasks.</p>
                  <Link href="/tasks" className="btn btn-primary">
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
