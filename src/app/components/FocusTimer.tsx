"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TimerRing from "./TimerRing";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { applyTheme, type ToolProps } from "@/lib/tools";
import { playAlarm, playTick } from "@/lib/audio";

type Mode = "focus" | "short" | "long";

const MODE_THEME: Record<
  Mode,
  { label: string; accent: string; soft: string; glow: string }
> = {
  focus: { label: "Focus", accent: "#f97362", soft: "#ff9d8f", glow: "249, 115, 98" },
  short: { label: "Short Break", accent: "#34d8c0", soft: "#6ff0dd", glow: "52, 216, 192" },
  long: { label: "Long Break", accent: "#6d8bff", soft: "#9db1ff", glow: "109, 139, 255" },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function FocusTimer({
  settings,
  onOpenSettings,
  soundControls,
  miniPlayer,
  onStart,
}: ToolProps) {
  const [stats, setStats] = useLocalStorage("tomo-stats", { day: "", count: 0 });
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);

  const deadlineRef = useRef<number | null>(null);
  const lastSecondRef = useRef(secondsLeft);

  const minutesFor = useCallback(
    (m: Mode) => (m === "focus" ? settings.focus : m === "short" ? settings.short : settings.long),
    [settings]
  );
  const total = minutesFor(mode) * 60;

  useEffect(() => {
    if (stats.day !== today()) setStats({ day: today(), count: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = MODE_THEME[mode];
    applyTheme(t.accent, t.soft, t.glow);
  }, [mode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!running) setSecondsLeft(minutesFor(mode) * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focus, settings.short, settings.long]);

  // Pause music on breaks, resume on focus.
  useEffect(() => {
    soundControls.current.onModeChange?.(mode === "focus" && running);
  }, [mode, running, soundControls]);

  const switchMode = useCallback(
    (next: Mode, autoStart: boolean) => {
      deadlineRef.current = null;
      setMode(next);
      setSecondsLeft(minutesFor(next) * 60);
      setRunning(autoStart);
    },
    [minutesFor]
  );

  useEffect(() => {
    if (!running) return;
    deadlineRef.current = Date.now() + secondsLeft * 1000;

    const tick = () => {
      const remaining = Math.round(((deadlineRef.current ?? 0) - Date.now()) / 1000);

      if (remaining <= 0) {
        setSecondsLeft(0);
        if (settings.soundOn)
          playAlarm(mode === "focus" ? "focusEnd" : "breakEnd", settings.volume);
        if (mode === "focus") {
          const count = (stats.day === today() ? stats.count : 0) + 1;
          setStats({ day: today(), count });
          switchMode(count % settings.longBreakInterval === 0 ? "long" : "short", settings.autoStart);
        } else {
          switchMode("focus", settings.autoStart);
        }
        return;
      }

      if (
        settings.ticking &&
        settings.soundOn &&
        mode === "focus" &&
        remaining !== lastSecondRef.current
      ) {
        playTick(settings.volume);
      }
      lastSecondRef.current = remaining;
      setSecondsLeft(remaining);
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");
    document.title = `${mm}:${ss} · ${MODE_THEME[mode].label} — Tomo`;
  }, [secondsLeft, mode]);

  const selectMode = (next: Mode) => {
    setRunning(false);
    deadlineRef.current = null;
    setMode(next);
    setSecondsLeft(minutesFor(next) * 60);
  };

  const toggleRun = () => {
    if (!running) onStart();
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    deadlineRef.current = null;
    setSecondsLeft(total);
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = total === 0 ? 0 : (total - secondsLeft) / total;
  const count = stats.day === today() ? stats.count : 0;

  return (
    <>
      <div className="surface z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="h-10 w-10" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
            {MODE_THEME[mode].label}
          </span>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="press grid h-10 w-10 place-items-center rounded-full bg-surface2 text-lg text-muted hover:text-fg"
          >
            ⚙
          </button>
        </div>

        <div className="mb-8 flex gap-1.5 rounded-full inset p-1.5">
          {(Object.keys(MODE_THEME) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => selectMode(m)}
              className={`press flex-1 rounded-full px-2 py-2 text-xs font-semibold sm:text-sm ${
                mode === m ? "text-white" : "text-muted hover:text-fg"
              }`}
              style={
                mode === m
                  ? { background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }
                  : undefined
              }
            >
              {MODE_THEME[m].label}
            </button>
          ))}
        </div>

        <TimerRing progress={progress}>
          <span className="tabular text-6xl font-bold sm:text-7xl">
            {minutes}:{seconds}
          </span>
          <span className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-faint">
            {running ? "In progress" : "Paused"}
          </span>
        </TimerRing>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={toggleRun}
            className="press btn-primary min-w-[150px] rounded-full px-8 py-4 text-base font-bold"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="press grid h-[56px] w-[56px] place-items-center rounded-full bg-surface2 text-fg"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {miniPlayer}
      </div>

      <p className="z-10 mt-7 text-sm text-muted">
        <span className="font-bold text-fg">{count}</span> focus
        {count === 1 ? " session" : " sessions"} completed today
      </p>
    </>
  );
}
