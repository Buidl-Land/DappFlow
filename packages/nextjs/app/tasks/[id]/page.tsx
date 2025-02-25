"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { mockTasks } from "~~/data/mockData";

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [applicationNote, setApplicationNote] = useState("");

  // Find task by ID
  const task = mockTasks.find(t => t.id === params.id);

  // Handle no task found
  if (!task) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h1 className="mb-4 text-2xl font-bold">Task not found</h1>
        <p className="mb-6">The task you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/tasks" className="btn btn-primary">
          Return to Tasks
        </Link>
      </div>
    );
  }

  const daysLeft = () => {
    const end = new Date(task.deadline).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
  };

  const handleApply = () => {
    // Mock apply action
    alert(`Your application has been submitted! You'll hear back from us soon.`);
    // In real implementation, this would connect to wallet and execute contract
    router.push("/dashboard");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-success";
      case "medium":
        return "text-warning";
      case "hard":
        return "text-error";
      default:
        return "";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "open":
        return <span className="badge badge-lg badge-success">Open for Applications</span>;
      case "assigned":
        return <span className="badge badge-lg badge-warning">Assigned</span>;
      case "in_progress":
        return <span className="badge badge-lg badge-warning">In Progress</span>;
      case "completed":
        return <span className="badge badge-lg badge-info">Completed</span>;
      case "verified":
        return <span className="badge badge-lg badge-info">Verified</span>;
      default:
        return <span className="badge badge-lg">{status}</span>;
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-4">
        <Link href="/tasks" className="gap-2 btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tasks
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Task Details Column */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">{task.title}</h1>
              {getStatusDisplay(task.status)}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-outline badge-lg">{task.category}</span>
              <span className={`badge badge-outline badge-lg ${getDifficultyColor(task.difficulty)}`}>
                {task.difficulty} difficulty
              </span>
            </div>
          </div>

          {/* Task Description */}
          <div className="p-6 mb-6 rounded-lg bg-base-200">
            <h2 className="mb-4 text-xl font-bold">Task Description</h2>
            <p className="mb-4 whitespace-pre-line">{task.description}</p>
          </div>

          {/* Requirements */}
          <div className="p-6 mb-6 rounded-lg bg-base-200">
            <h2 className="mb-4 text-xl font-bold">Requirements</h2>
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {task.requirements.skills.map(skill => (
                  <span key={skill} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Experience Level</h3>
              <p>{task.requirements.experienceLevel}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 mb-6 rounded-lg bg-base-200">
            <h2 className="mb-4 text-xl font-bold">Timeline</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-semibold">Created</h3>
                <p>{new Date(task.timeline.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">Deadline</h3>
                <p>
                  {new Date(task.deadline).toLocaleDateString()} ({daysLeft()} days left)
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">Estimated Hours</h3>
                <p>{task.timeline.estimatedHours} hours</p>
              </div>
            </div>
          </div>

          {/* Submission Guidelines */}
          <div className="p-6 rounded-lg bg-base-200">
            <h2 className="mb-4 text-xl font-bold">Submission Guidelines</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Complete all requirements as specified in the task description</li>
              <li>Provide a link to a GitHub repository with your implementation</li>
              <li>Include documentation on how to run and test your work</li>
              <li>Submit your work before the deadline</li>
              <li>Be available for review discussions after submission</li>
            </ul>
          </div>
        </div>

        {/* Application Panel Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 p-6 rounded-lg shadow-lg bg-base-100">
            <h2 className="mb-4 text-xl font-bold">Task Details</h2>

            {/* Reward Info */}
            <div className="p-4 mb-4 text-center rounded-md bg-base-200">
              <h3 className="mb-2 text-lg font-semibold">Reward</h3>
              <div className="text-3xl font-bold text-primary">
                {task.reward.amount} {task.reward.token}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Status:</span>
                <span>{task.status.replace("_", " ")}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Deadline:</span>
                <span>{daysLeft()} days left</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Estimated Time:</span>
                <span>{task.timeline.estimatedHours} hours</span>
              </div>
            </div>

            <div className="divider"></div>

            {/* Apply Form */}
            {task.status === "open" ? (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Apply for this Task</h3>
                <div className="mb-4 form-control">
                  <label className="label">
                    <span className="label-text">Your application note</span>
                  </label>
                  <textarea
                    className="h-24 textarea textarea-bordered"
                    placeholder="Briefly describe why you're a good fit for this task"
                    value={applicationNote}
                    onChange={e => setApplicationNote(e.target.value)}
                  ></textarea>
                </div>

                <button className="w-full btn btn-primary" disabled={!applicationNote.trim()} onClick={handleApply}>
                  Apply Now
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4">This task is no longer accepting applications.</p>
                <Link href="/tasks" className="btn btn-outline btn-wide">
                  Browse Other Tasks
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
