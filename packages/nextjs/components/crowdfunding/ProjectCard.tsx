import React from "react";
import Link from "next/link";
import { FundingProgress } from "./FundingProgress";
import { MouseTracker } from "~~/components/motion/MouseTracker";

interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  raisedAmount: number;
  fundingGoal: number;
  participants: number;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <MouseTracker>
      <Link href={`/crowdfunding/${project.id}`} className="block">
        <div className="card card-hover animate-slide-up">
          <div className="p-6">
            <h3 className="mb-2 text-xl font-bold text-content-primary">{project.title}</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <p className="mb-4 text-content-secondary">{project.summary}</p>

            <div className="mt-4 mb-2">
              <FundingProgress
                raised={project.raisedAmount}
                goal={project.fundingGoal}
                participants={project.participants}
              />
            </div>

            <div className="flex justify-end mt-4">
              <button className="btn btn-gradient btn-sm">View Details</button>
            </div>
          </div>
        </div>
      </Link>
    </MouseTracker>
  );
};
