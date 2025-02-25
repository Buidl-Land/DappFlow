"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FundingProgress } from "~~/components/crowdfunding/FundingProgress";
import { mockProjects } from "~~/data/mockData";

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [investAmount, setInvestAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("MON");

  // Find project by ID
  const project = mockProjects.find(p => p.id === params.id);

  // Handle no project found
  if (!project) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h1 className="mb-4 text-2xl font-bold">Project not found</h1>
        <p className="mb-6">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/crowdfunding" className="btn btn-primary">
          Return to Projects
        </Link>
      </div>
    );
  }

  const daysLeft = () => {
    const end = new Date(project.endDate).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
  };

  const handleInvest = () => {
    // Mock invest action
    alert(`Thank you for investing ${investAmount} ${selectedToken}!`);
    // In real implementation, this would connect to wallet and execute contract
    router.push("/dashboard");
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-4">
        <Link href="/crowdfunding" className="gap-2 btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Project Details Column */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="badge badge-lg badge-primary">{daysLeft()} days left</div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map(tag => (
                <span key={tag} className="badge badge-outline">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* AI Assessment Card */}
          <div className="p-4 mb-6 rounded-lg bg-base-200">
            <h3 className="mb-3 text-lg font-bold">AI Project Assessment</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="p-3 rounded-md bg-base-100">
                <div className="text-sm font-semibold opacity-70">Risk Score</div>
                <div className="flex justify-between items-center">
                  <div
                    className={`text-xl font-bold ${
                      project.aiAssessment.riskScore > 70
                        ? "text-error"
                        : project.aiAssessment.riskScore > 40
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {project.aiAssessment.riskScore}/100
                  </div>
                  <div
                    className="radial-progress"
                    style={
                      {
                        "--value": project.aiAssessment.riskScore,
                        "--size": "2.5rem",
                        "--thickness": "2px",
                        color:
                          project.aiAssessment.riskScore > 70
                            ? "var(--error)"
                            : project.aiAssessment.riskScore > 40
                              ? "var(--warning)"
                              : "var(--success)",
                      } as React.CSSProperties
                    }
                    role="progressbar"
                  >
                    {project.aiAssessment.riskScore}%
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-base-100">
                <div className="text-sm font-semibold opacity-70">Technical Feasibility</div>
                <div className="flex justify-between items-center">
                  <div
                    className={`text-xl font-bold ${
                      project.aiAssessment.technicalFeasibility < 30
                        ? "text-error"
                        : project.aiAssessment.technicalFeasibility < 60
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {project.aiAssessment.technicalFeasibility}/100
                  </div>
                  <div
                    className="radial-progress"
                    style={
                      {
                        "--value": project.aiAssessment.technicalFeasibility,
                        "--size": "2.5rem",
                        "--thickness": "2px",
                        color:
                          project.aiAssessment.technicalFeasibility < 30
                            ? "var(--error)"
                            : project.aiAssessment.technicalFeasibility < 60
                              ? "var(--warning)"
                              : "var(--success)",
                      } as React.CSSProperties
                    }
                    role="progressbar"
                  >
                    {project.aiAssessment.technicalFeasibility}%
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-base-100">
                <div className="text-sm font-semibold opacity-70">Valuation Range</div>
                <div className="text-xl font-bold">
                  ${(project.aiAssessment.valuationRange.min / 1000000).toFixed(1)}M - $
                  {(project.aiAssessment.valuationRange.max / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold">Project Description</h2>
            <p className="mb-4 whitespace-pre-line">{project.description}</p>
          </div>

          {/* Fund Allocation */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold">Fund Allocation</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-3 text-center rounded-lg bg-base-200">
                <div className="text-sm font-semibold opacity-70">Development</div>
                <div className="mt-1 text-2xl font-bold">{project.fundAllocation.development}%</div>
              </div>
              <div className="p-3 text-center rounded-lg bg-base-200">
                <div className="text-sm font-semibold opacity-70">Operations</div>
                <div className="mt-1 text-2xl font-bold">{project.fundAllocation.operations}%</div>
              </div>
              <div className="p-3 text-center rounded-lg bg-base-200">
                <div className="text-sm font-semibold opacity-70">Community</div>
                <div className="mt-1 text-2xl font-bold">{project.fundAllocation.community}%</div>
              </div>
            </div>
          </div>

          {/* Token Distribution */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold">Token Distribution</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-3 text-center rounded-lg bg-base-200">
                <div className="text-sm font-semibold opacity-70">Crowdfunding</div>
                <div className="mt-1 text-2xl font-bold">{project.tokenDistribution.crowdfunding}%</div>
              </div>
              <div className="p-3 text-center rounded-lg bg-base-200">
                <div className="text-sm font-semibold opacity-70">Team</div>
                <div className="mt-1 text-2xl font-bold">{project.tokenDistribution.team}%</div>
              </div>
              <div className="p-3 text-center rounded-lg bg-base-200">
                <div className="text-sm font-semibold opacity-70">Ecosystem</div>
                <div className="mt-1 text-2xl font-bold">{project.tokenDistribution.ecosystem}%</div>
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold">Roadmap</h2>
            <ul className="timeline timeline-vertical">
              {project.roadmap.map((stage, index) => (
                <li key={index}>
                  <div className="timeline-start">{stage.timeline}</div>
                  <div className={`timeline-middle ${stage.completed ? "text-success" : ""}`}>
                    {stage.completed ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="pb-8 timeline-end timeline-box">
                    <h3 className="font-bold">{stage.phase}</h3>
                    <p className="text-sm">{stage.description}</p>
                  </div>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Investment Panel Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 p-6 rounded-lg shadow-lg bg-base-100">
            <h2 className="mb-4 text-xl font-bold">Crowdfunding Details</h2>

            <div className="mb-6">
              <FundingProgress
                raised={project.raisedAmount}
                goal={project.fundingGoal}
                participants={project.participants}
              />
            </div>

            <div className="mb-4 divider"></div>

            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Invest in this project</h3>
              <div className="mb-3 form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <label className="input-group">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full input input-bordered"
                    value={investAmount}
                    onChange={e => setInvestAmount(e.target.value)}
                    min="0"
                  />
                  <select
                    className="select select-bordered"
                    value={selectedToken}
                    onChange={e => setSelectedToken(e.target.value)}
                  >
                    <option value="MON">MON</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </label>
              </div>

              <div className="mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Min Investment</span>
                  <span className="font-medium">100 {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Tokens</span>
                  <span className="font-medium">
                    {investAmount ? (Number(investAmount) * 10).toLocaleString() : 0} PROJECT
                  </span>
                </div>
              </div>

              <button
                className="w-full btn btn-primary"
                disabled={!investAmount || parseFloat(investAmount) <= 0}
                onClick={handleInvest}
              >
                Invest Now
              </button>

              <div className="mt-4 text-xs text-center opacity-70">
                <p>By investing, you agree to the project&apos;s terms and conditions.</p>
                <p>40% of tokens will be released immediately, 60% vested over 6 months</p>
              </div>
            </div>

            <div className="mb-4 divider"></div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Funding Timeline</h3>
              <div className="mb-2">
                <div className="text-xs opacity-70">Start Date</div>
                <div>{new Date(project.startDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">End Date</div>
                <div>{new Date(project.endDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
