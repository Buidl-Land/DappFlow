import { FC } from "react";
import Link from "next/link";
import { FundingProgress } from "./FundingProgress";
import { type Project } from "~~/data/mockData";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const daysLeft = () => {
    const end = new Date(project.endDate).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="w-full shadow-xl transition-shadow card bg-base-100 hover:shadow-2xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold card-title">{project.title}</h2>
          <div className="badge badge-primary">{daysLeft() > 0 ? `${daysLeft()} days left` : "Ended"}</div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {project.tags.map(tag => (
            <span key={tag} className="badge badge-outline badge-secondary">
              {tag}
            </span>
          ))}
        </div>

        <p className="my-4 text-sm">{project.summary}</p>

        <div className="mt-2 mb-4">
          <FundingProgress
            raised={project.raisedAmount}
            goal={project.fundingGoal}
            participants={project.participants}
          />
        </div>

        <div className="p-3 mb-4 rounded-md bg-base-200">
          <div className="mb-1 text-sm font-bold">AI Assessment</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs opacity-70">Risk Score</div>
              <div
                className={`font-semibold ${project.aiAssessment.riskScore > 70 ? "text-error" : project.aiAssessment.riskScore > 40 ? "text-warning" : "text-success"}`}
              >
                {project.aiAssessment.riskScore}/100
              </div>
            </div>
            <div>
              <div className="text-xs opacity-70">Tech Feasibility</div>
              <div
                className={`font-semibold ${project.aiAssessment.technicalFeasibility < 30 ? "text-error" : project.aiAssessment.technicalFeasibility < 60 ? "text-warning" : "text-success"}`}
              >
                {project.aiAssessment.technicalFeasibility}/100
              </div>
            </div>
            <div>
              <div className="text-xs opacity-70">Valuation</div>
              <div className="font-semibold">
                ${(project.aiAssessment.valuationRange.min / 1000000).toFixed(1)}M - $
                {(project.aiAssessment.valuationRange.max / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>

        <div className="justify-end mt-2 card-actions">
          <Link href={`/crowdfunding/${project.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
