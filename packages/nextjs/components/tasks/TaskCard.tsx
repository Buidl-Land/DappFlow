import React from "react";
import Link from "next/link";
import { MouseTracker } from "~~/components/motion/MouseTracker";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "development" | "design" | "marketing";
  difficulty: "easy" | "medium" | "hard";
  reward: {
    amount: number;
    token: string;
  };
  deadline: string;
  status: "open" | "assigned" | "in_progress" | "completed" | "verified";
  requirements: {
    skills: string[];
    experienceLevel: string;
  };
  timeline: {
    createdAt: string;
    estimatedHours: number;
  };
  assignedTo?: string;
}

interface TaskCardProps {
  task: Task;
}

const getDifficultyColor = (difficulty: Task["difficulty"]) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-20 dark:text-yellow-400";
    case "hard":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400";
  }
};

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400";
    case "in_progress":
    case "assigned":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-400";
    case "completed":
    case "verified":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400";
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const formattedDeadline = new Date(task.deadline).toLocaleDateString();

  return (
    <MouseTracker>
      <Link href={`/tasks/${task.id}`} className="block">
        <div className="card card-hover animate-slide-up">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-content-primary">{task.title}</h3>
              <div className="flex gap-2 items-center">
                <span className={`tag ${getDifficultyColor(task.difficulty)}`}>{task.difficulty}</span>
                <span className={`tag ${getStatusColor(task.status)}`}>{task.status.replace("_", " ")}</span>
              </div>
            </div>

            <p className="mb-4 text-content-secondary">{task.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {task.requirements.skills.map(skill => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-4 items-center">
                <div>
                  <span className="text-sm text-content-secondary">Reward</span>
                  <div className="text-lg font-semibold gradient-text-primary">
                    {task.reward.amount} {task.reward.token}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-content-secondary">Deadline</span>
                  <div className="text-base text-content-primary">{formattedDeadline}</div>
                </div>
              </div>

              <button className="btn btn-outline-glow btn-sm">View Details</button>
            </div>
          </div>
        </div>
      </Link>
    </MouseTracker>
  );
};
