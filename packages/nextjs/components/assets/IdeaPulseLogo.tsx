import React from "react";
import { useTheme } from "next-themes";

export const IdeaPulseLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Circle - Pulse Effect */}
      <circle
        cx="50"
        cy="50"
        r="45"
        className={`${isDarkMode ? "stroke-primary-dark" : "stroke-primary-light"} animate-pulse-soft`}
        strokeWidth="2"
      />

      {/* Brain Pattern */}
      <path
        d="M30 50C30 38.954 38.954 30 50 30C61.046 30 70 38.954 70 50C70 61.046 61.046 70 50 70"
        className={`${isDarkMode ? "stroke-secondary-dark" : "stroke-secondary-light"}`}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Innovation Sparks */}
      <g className="animate-bounce-soft">
        <circle cx="50" cy="35" r="3" className={`${isDarkMode ? "fill-accent-dark" : "fill-accent-light"}`} />
        <circle cx="65" cy="50" r="3" className={`${isDarkMode ? "fill-accent-dark" : "fill-accent-light"}`} />
        <circle cx="35" cy="50" r="3" className={`${isDarkMode ? "fill-accent-dark" : "fill-accent-light"}`} />
      </g>

      {/* Connection Lines */}
      <path
        d="M50 35L65 50M65 50L50 65M35 50L50 35"
        className={`${isDarkMode ? "stroke-secondary-dark" : "stroke-secondary-light"}`}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Center Pulse */}
      <circle
        cx="50"
        cy="50"
        r="5"
        className={`${isDarkMode ? "fill-primary-dark" : "fill-primary-light"} animate-pulse-soft`}
      />
    </svg>
  );
};
