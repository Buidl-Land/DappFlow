"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isDarkMode) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <button
        type="button"
        className={`flex items-center justify-center transition-colors ${
          isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"
        }`}
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        onClick={handleToggle}
      >
        {isDarkMode ? (
          <MoonIcon className="h-7 w-7 text-blue-300" />
        ) : (
          <SunIcon className="h-7 w-7 text-yellow-500" />
        )}
      </button>
    </div>
  );
};
