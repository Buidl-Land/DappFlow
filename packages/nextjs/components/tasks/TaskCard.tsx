import { FC } from "react";
import Link from "next/link";
import { type Task } from "~~/data/mockData";

interface TaskCardProps {
  task: Task;
}

export const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const daysLeft = () => {
    const end = new Date(task.deadline).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "hard":
        return "badge-error";
      default:
        return "badge-primary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "badge-success";
      case "assigned":
      case "in_progress":
        return "badge-warning";
      case "completed":
      case "verified":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  return (
    <div className="w-full shadow-lg transition-all card bg-base-100 hover:shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="text-lg card-title">{task.title}</h3>
          <div className="flex flex-col gap-1 items-end">
            <div className={`badge ${getStatusColor(task.status)}`}>{task.status.replace("_", " ")}</div>
            <div className={`badge ${getDifficultyColor(task.difficulty)}`}>{task.difficulty}</div>
          </div>
        </div>

        <div className="my-2">
          <div className="badge badge-outline badge-secondary">{task.category}</div>
        </div>

        <p className="my-2 text-sm line-clamp-2">{task.description}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {task.requirements.skills.map(skill => (
            <span key={skill} className="badge badge-sm">
              {skill}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 text-sm">
          <div>
            <div className="text-xs opacity-70">Reward</div>
            <div className="font-semibold">
              {task.reward.amount} {task.reward.token}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-70">Estimated Time</div>
            <div className="font-semibold">{task.timeline.estimatedHours} hrs</div>
          </div>
          <div>
            <div className="text-xs opacity-70">Experience</div>
            <div className="font-semibold">{task.requirements.experienceLevel}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">Deadline</div>
            <div className="font-semibold">{daysLeft() > 0 ? `${daysLeft()} days left` : "Expired"}</div>
          </div>
        </div>

        <div className="justify-end mt-2 card-actions">
          <Link href={`/tasks/${task.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
