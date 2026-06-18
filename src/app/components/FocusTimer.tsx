"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Settings, RotateCcw } from "lucide-react";
import TimerRing from "./TimerRing";
import Segmented from "./Segmented";
import { applyTheme, type ToolProps } from "@/lib/tools";
import { playAlarm, playTick } from "@/lib/audio";

type Mode = "focus" | "short" | "long";

const MODE_THEME: Record<
  Mode,
  { label: string; accent: string; soft: string; glow: string }
> = {
  focus: { label: "Focus", accent: "#f97362", soft: "#ff9d8f", glow: "249, 115, 98" },
  short: { label: "Short Break", accent: "#3ecf8e", soft: "#6fe3ab", glow: "62, 207, 142" },
  long: { label: "Long Break", accent: "#6d8bff", soft: "#9db1ff", glow: "109, 139, 255" },
};

export default function FocusTimer({
  settings,
  onOpenSettings,
  soundControls,
  miniPlayer,
  onStart,
  onFocusComplete,
  todayCount,
  streak,
  active,
}: ToolProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);

  const deadlineRef = useRef<number | null>(null);
  const lastSecondRef = useRef(secondsLeft);
  // Each mode remembers its own remaining time across tab switches.
  const savedRef = useRef<Record<Mode, number>>({
    focus: settings.focus * 60,
    short: settings.short * 60,
    long: settings.long * 60,
  });
  // Latest settings, so the running tick reflects live changes (e.g. toggling the ticking clock).
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  const minutesFor = useCallback(
    (m: Mode) => (m === "focus" ? settings.focus : m === "short" ? settings.short : settings.long),
    [settings]
  );
  const total = minutesFor(mode) * 60;

  useEffect(() => {
    if (!active) return;
    const t = MODE_THEME[mode];
    applyTheme(t.accent, t.soft, t.glow);
  }, [mode, active]);

  useEffect(() => {
    // Changing a duration in Settings resets each mode to its new full length.
    savedRef.current = {
      focus: settings.focus * 60,
      short: settings.short * 60,
      long: settings.long * 60,
    };
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
      const full = minutesFor(next) * 60;
      savedRef.current[next] = full;
      setMode(next);
      setSecondsLeft(full);
      setRunning(autoStart);
    },
    [minutesFor]
  );

  useEffect(() => {
    if (!running) return;
    deadlineRef.current = Date.now() + secondsLeft * 1000;

    const tick = () => {
      const s = settingsRef.current; // read live settings every tick
      const remaining = Math.round(((deadlineRef.current ?? 0) - Date.now()) / 1000);

      if (remaining <= 0) {
        setSecondsLeft(0);
        savedRef.current[mode] = minutesFor(mode) * 60; // finished mode resets for next time
        if (s.soundOn) playAlarm(mode === "focus" ? "focusEnd" : "breakEnd", s.volume);
        if (mode === "focus") {
          onFocusComplete(s.focus);
          const nextCount = todayCount + 1;
          switchMode(nextCount % s.longBreakInterval === 0 ? "long" : "short", s.autoStart);
        } else {
          switchMode("focus", s.autoStart);
        }
        return;
      }

      if (s.ticking && s.soundOn && mode === "focus" && remaining !== lastSecondRef.current) {
        playTick(s.volume);
      }
      lastSecondRef.current = remaining;
      setSecondsLeft(remaining);
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!active) return;
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");
    document.title = `${mm}:${ss} · ${MODE_THEME[mode].label} — Tomo`;
  }, [secondsLeft, mode, active]);

  const selectMode = (next: Mode) => {
    if (next === mode) return;
    // Remember where this mode is, pause, then restore the target mode's time.
    savedRef.current[mode] = secondsLeft;
    setRunning(false);
    deadlineRef.current = null;
    setMode(next);
    const saved = savedRef.current[next];
    setSecondsLeft(saved > 0 ? saved : minutesFor(next) * 60);
  };

  const toggleRun = () => {
    if (!running) onStart();
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    deadlineRef.current = null;
    savedRef.current[mode] = total;
    setSecondsLeft(total);
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = total === 0 ? 0 : (total - secondsLeft) / total;

  return (
    <>
      <div className="surface z-10 w-full max-w-md rounded-[2rem] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="h-10 w-10" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
            {MODE_THEME[mode].label}
          </span>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="press grid h-10 w-10 place-items-center rounded-full bg-surface2 text-muted hover:text-fg"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="mb-6">
          <Segmented
            items={(Object.keys(MODE_THEME) as Mode[]).map((m) => ({ key: m, label: MODE_THEME[m].label }))}
            value={mode}
            onChange={(k) => selectMode(k as Mode)}
          />
        </div>

        <TimerRing progress={progress}>
          <span className="tabular text-5xl font-bold sm:text-6xl">
            {minutes}:{seconds}
          </span>
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-faint">
            {running ? "In progress" : "Paused"}
          </span>
        </TimerRing>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={toggleRun}
            className="press btn-primary min-w-[150px] rounded-full px-8 py-4 text-base font-bold"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="press grid h-14 w-14 place-items-center rounded-full bg-surface2 text-fg"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {miniPlayer}
      </div>

      <div className="z-10 mt-5 flex items-center gap-5 text-sm text-muted">
        <span>
          <span className="font-bold text-fg">{todayCount}</span> today
        </span>
        <span className="text-faint">·</span>
        <span className="flex items-center gap-1">
          <span aria-hidden>🔥</span>
          <span className="font-bold text-fg">{streak}</span> day streak
        </span>
      </div>
    </>
  );
}
