"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import SettingsModal from "./components/SettingsModal";
import SoundPanel, { type SoundControls } from "./components/SoundPanel";
import InstallPrompt from "./components/InstallPrompt";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";
import { playAlarm, playTick, resumeAudio } from "@/lib/audio";

type Mode = "focus" | "short" | "long";

const MODE_THEME: Record<
  Mode,
  { label: string; accent: string; soft: string; glow: string }
> = {
  focus: { label: "Focus", accent: "#f97362", soft: "#ff9d8f", glow: "249, 115, 98" },
  short: { label: "Short Break", accent: "#34d8c0", soft: "#6ff0dd", glow: "52, 216, 192" },
  long: { label: "Long Break", accent: "#6d8bff", soft: "#9db1ff", glow: "109, 139, 255" },
};

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const today = () => new Date().toISOString().slice(0, 10);

export default function Home() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "tomo-settings",
    DEFAULT_SETTINGS
  );
  const [stats, setStats] = useLocalStorage("tomo-stats", { day: "", count: 0 });

  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SETTINGS.focus * 60);
  const [running, setRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);

  const deadlineRef = useRef<number | null>(null);
  const lastSecondRef = useRef(secondsLeft);
  const soundControls = useRef<SoundControls>({});

  const minutesFor = useCallback(
    (m: Mode) => (m === "focus" ? settings.focus : m === "short" ? settings.short : settings.long),
    [settings]
  );
  const total = minutesFor(mode) * 60;

  // Reset the daily counter when the date rolls over.
  useEffect(() => {
    if (stats.day !== today()) setStats({ day: today(), count: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply the active mode's colors.
  useEffect(() => {
    const t = MODE_THEME[mode];
    const root = document.documentElement.style;
    root.setProperty("--accent", t.accent);
    root.setProperty("--accent-soft", t.soft);
    root.setProperty("--glow", t.glow);
  }, [mode]);

  // If durations change while idle, reflect them immediately.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!running) setSecondsLeft(minutesFor(mode) * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focus, settings.short, settings.long]);

  // Tell the sound panel when we're focusing vs. resting.
  useEffect(() => {
    soundControls.current.onModeChange?.(mode === "focus" && running);
  }, [mode, running]);

  const switchMode = useCallback(
    (next: Mode, autoStart: boolean) => {
      deadlineRef.current = null;
      setMode(next);
      setSecondsLeft(minutesFor(next) * 60);
      setRunning(autoStart);
    },
    [minutesFor]
  );

  // Countdown driven by a wall-clock deadline so it never drifts.
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

      // ticking clock during focus
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

  // Live tab title.
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
    resumeAudio();
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
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const count = stats.day === today() ? stats.count : 0;

  return (
    <>
      <SiteHeader />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-24">
        <div
          className="blob blob-a left-[-120px] top-[-80px] h-[340px] w-[340px]"
          style={{ background: "rgba(var(--glow), 0.55)" }}
        />
        <div
          className="blob blob-b bottom-[-120px] right-[-100px] h-[360px] w-[360px]"
          style={{ background: "var(--accent-soft)" }}
        />

        <header className="z-10 mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tomo
          </h1>
          <p className="mt-1 text-sm text-white/50">Your focus friend · Focus. Break. Repeat.</p>
        </header>

        <div className="card-3d z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
          {/* Top actions */}
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={() => setSoundOpen(true)}
              aria-label="Focus sounds"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            >
              ♪
            </button>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              {MODE_THEME[mode].label}
            </span>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            >
              ⚙
            </button>
          </div>

          {/* Mode tabs */}
          <div className="mb-8 flex gap-1.5 rounded-full bg-black/20 p-1.5">
            {(Object.keys(MODE_THEME) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => selectMode(m)}
                className={`flex-1 rounded-full px-2 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  mode === m ? "text-white shadow-lg" : "text-white/50 hover:text-white/80"
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

          {/* Circular timer */}
          <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
              <circle
                cx="150"
                cy="150"
                r={RADIUS}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{
                  transition: "stroke-dashoffset 0.4s linear",
                  filter: "drop-shadow(0 0 10px rgba(var(--glow), 0.8))",
                }}
              />
            </svg>
            <div className="z-10 flex flex-col items-center">
              <span className="tabular text-6xl font-bold sm:text-7xl">
                {minutes}:{seconds}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                {running ? "In progress" : "Paused"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={toggleRun}
              className="btn-3d btn-primary min-w-[150px] px-8 py-4 text-base font-bold text-white"
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={reset}
              aria-label="Reset timer"
              className="btn-3d grid h-[56px] w-[56px] place-items-center bg-white/10 text-white/80"
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
        </div>

        <p className="z-10 mt-7 text-sm text-white/50">
          <span className="font-bold text-white/80">{count}</span> focus
          {count === 1 ? " session" : " sessions"} completed today
        </p>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
      />
      <SoundPanel
        open={soundOpen}
        onClose={() => setSoundOpen(false)}
        volume={settings.volume}
        autoplayFocus={settings.autoplayFocus}
        onAutoplayChange={(v) => setSettings({ ...settings, autoplayFocus: v })}
        registerControls={(c) => (soundControls.current = c)}
      />
      <InstallPrompt />
    </>
  );
}
