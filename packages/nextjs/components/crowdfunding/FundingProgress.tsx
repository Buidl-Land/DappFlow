import { FC } from "react";

interface FundingProgressProps {
  raised: number;
  goal: number;
  participants: number;
}

export const FundingProgress: FC<FundingProgressProps> = ({ raised, goal, participants }) => {
  const percentage = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold">
          ${raised.toLocaleString()} raised of ${goal.toLocaleString()}
        </span>
        <span className="text-sm font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="text-xs text-right">
        <span className="font-medium">{participants} participants</span>
      </div>
    </div>
  );
};
