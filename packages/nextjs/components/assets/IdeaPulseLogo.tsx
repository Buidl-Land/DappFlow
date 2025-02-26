import React from "react";
import { useTheme } from "next-themes";

export const IdeaPulseLogo = ({
  className = "",
  withAnimation = true,
}: {
  className?: string;
  withAnimation?: boolean;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <img
      src={`/${withAnimation ? "logo" : "logo-static"}${isDarkMode ? "" : "-light"}.svg`}
      alt="IdeaPulse Logo"
      className={`h-10 w-auto ${className}`}
    />
  );
};
