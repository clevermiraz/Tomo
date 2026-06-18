"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, RotateCcw } from "lucide-react";
import TimerRing from "./TimerRing";
import Segmented from "./Segmented";
import { applyTheme, type ToolProps } from "@/lib/tools";
import { playAlarm } from "@/lib/audio";

const PRESETS = [10, 20, 30, 45, 60]; // minutes
const NAP_THEME = { accent: "#8b7cf6", soft: "#b3a6ff", glow: "139, 124, 246" };

export default function QuickNap({
  settings,
  onOpenSettings,
  miniPlayer,
  onStart,
}: ToolProps) {
  const [minutesPreset, setMinutesPreset] = useState(20);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);

  const total = minutesPreset * 60;

  useEffect(() => {
    applyTheme(NAP_THEME.accent, NAP_THEME.soft, NAP_THEME.glow);
  }, []);

  const selectPreset = (m: number) => {
    setRunning(false);
    deadlineRef.current = null;
    setMinutesPreset(m);
    setSecondsLeft(m * 60);
  };

  useEffect(() => {
    if (!running) return;
    deadlineRef.current = Date.now() + secondsLeft * 1000;
    const tick = () => {
      const remaining = Math.round(((deadlineRef.current ?? 0) - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        setRunning(false);
        // Gentle wake-up: chime a few times.
        if (settings.soundOn) {
          playAlarm("focusEnd", settings.volume);
          setTimeout(() => playAlarm("focusEnd", settings.volume), 1200);
        }
        if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200, 100, 200]);
        return;
      }
      setSecondsLeft(remaining);
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");
    document.title = `${mm}:${ss} · Quick Nap — Tomo`;
  }, [secondsLeft]);

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
  const done = secondsLeft === 0;

  return (
    <>
      <div className="surface z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="h-10 w-10" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
            Quick Nap
          </span>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="press grid h-10 w-10 place-items-center rounded-full bg-surface2 text-muted hover:text-fg"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="mb-8">
          <Segmented
            items={PRESETS.map((m) => ({ key: String(m), label: `${m}m` }))}
            value={String(minutesPreset)}
            onChange={(k) => selectPreset(Number(k))}
          />
        </div>

        <TimerRing progress={progress}>
          <span className="tabular text-6xl font-bold sm:text-7xl">
            {minutes}:{seconds}
          </span>
          <span className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-faint">
            {done ? "Time to wake" : running ? "Napping" : "Ready"}
          </span>
        </TimerRing>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={toggleRun}
            className="press btn-primary min-w-[150px] rounded-full px-8 py-4 text-base font-bold"
          >
            {running ? "Pause" : done ? "Nap again" : "Start nap"}
          </button>
          <button
            onClick={reset}
            aria-label="Reset nap"
            className="press grid h-14 w-14 place-items-center rounded-full bg-surface2 text-fg"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {miniPlayer}
      </div>

      <p className="z-10 mt-7 max-w-xs text-center text-sm text-muted">
        A 20-minute power nap boosts alertness without grogginess. Tomo wakes you gently.
      </p>
    </>
  );
}
