import type { RefObject, ReactNode } from "react";
import type { Settings } from "@/lib/settings";
import type { SoundControls } from "@/app/components/SoundPanel";

export type Tool = "focus" | "nap" | "breathe";

export interface ToolProps {
  settings: Settings;
  onOpenSettings: () => void;
  soundControls: RefObject<SoundControls>;
  /** Embedded now-playing mini-player (shared across tools). */
  miniPlayer: ReactNode;
  /** Call when a session begins: resumes audio and starts default music. */
  onStart: () => void;
  /** Called when a focus session completes (Focus Garden). */
  onFocusComplete: (minutes: number) => void;
  /** Focus sessions completed today. */
  todayCount: number;
  /** Current daily streak. */
  streak: number;
  /** Whether this tool is the visible one (others stay mounted so timers keep running). */
  active: boolean;
}

/** Apply a tool/mode accent to the global CSS variables. */
export function applyTheme(accent: string, soft: string, glow: string) {
  const root = document.documentElement.style;
  root.setProperty("--accent", accent);
  root.setProperty("--accent-soft", soft);
  root.setProperty("--glow", glow);
}
