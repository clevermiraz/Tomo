"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as "light" | "dark") || "dark";
    // Sync to the theme the inline pre-paint script already applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("tomo-theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="press grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-fg/70 hover:text-fg"
    >
      {theme === "dark" ? <Moon size={17} /> : <Sun size={18} />}
    </button>
  );
}
