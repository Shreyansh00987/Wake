"use client";

import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted theme or default to dark
    const stored = localStorage.getItem("wake-theme") as "dark" | "light" | null;
    const initialTheme = stored || "dark";
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  function applyTheme(newTheme: "dark" | "light") {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("wake-theme", newTheme);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  if (!mounted) {
    return (
      <div className="w-16 h-6 border border-hairline bg-surface/30 opacity-50" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="px-2.5 py-1 border border-hairline hover:border-hairline-light bg-surface/40 hover:bg-surface text-content text-xs font-mono transition-all flex items-center gap-1.5 rounded-sm group select-none"
    >
      <span className="text-ash group-hover:text-content transition-colors text-[11px]">
        {theme === "dark" ? "☾" : "☼"}
      </span>
      <span className="capitalize text-[11px]">
        {theme}
      </span>
    </button>
  );
}
