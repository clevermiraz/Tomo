"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "focus" | "short" | "long";

const MODES: Record<
  Mode,
  { label: string; minutes: number; accent: string; soft: string; glow: string }
> = {
  focus: {
    label: "Focus",
    minutes: 25,
    accent: "#f97362",
    soft: "#ff9d8f",
    glow: "249, 115, 98",
  },
  short: {
    label: "Short Break",
    minutes: 5,
    accent: "#34d8c0",
    soft: "#6ff0dd",
    glow: "52, 216, 192",
  },
  long: {
    label: "Long Break",
    minutes: 15,
    accent: "#6d8bff",
    soft: "#9db1ff",
    glow: "109, 139, 255",
  },
};

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Home() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);

  const total = MODES[mode].minutes * 60;
  const deadlineRef = useRef<number | null>(null);

  // Apply the active mode's colors to CSS variables.
  useEffect(() => {
    const m = MODES[mode];
    const root = document.documentElement.style;
    root.setProperty("--accent", m.accent);
    root.setProperty("--accent-soft", m.soft);
    root.setProperty("--glow", m.glow);
  }, [mode]);

  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const notes = [880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch {
      /* audio not available */
    }
  }, []);

  const switchMode = useCallback((next: Mode) => {
    setRunning(false);
    deadlineRef.current = null;
    setMode(next);
    setSecondsLeft(MODES[next].minutes * 60);
  }, []);

  // Countdown driven by a wall-clock deadline so it never drifts.
  useEffect(() => {
    if (!running) return;

    deadlineRef.current = Date.now() + secondsLeft * 1000;
    const tick = () => {
      const remaining = Math.round(
        ((deadlineRef.current ?? 0) - Date.now()) / 1000
      );
      if (remaining <= 0) {
        setSecondsLeft(0);
        setRunning(false);
        playChime();
        if (mode === "focus") {
          const next = completed + 1;
          setCompleted(next);
          switchMode(next % 4 === 0 ? "long" : "short");
        } else {
          switchMode("focus");
        }
        return;
      }
      setSecondsLeft(remaining);
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Keep the document title in sync as a mini live timer.
  useEffect(() => {
    const mm = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");
    document.title = `${mm}:${ss} · ${MODES[mode].label}`;
  }, [secondsLeft, mode]);

  const reset = () => {
    setRunning(false);
    deadlineRef.current = null;
    setSecondsLeft(total);
  };

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = total === 0 ? 0 : (total - secondsLeft) / total;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      {/* Ambient background blobs */}
      <div
        className="blob blob-a left-[-120px] top-[-80px] h-[340px] w-[340px]"
        style={{ background: "rgba(var(--glow), 0.55)" }}
      />
      <div
        className="blob blob-b bottom-[-120px] right-[-100px] h-[360px] w-[360px]"
        style={{ background: "var(--accent-soft)" }}
      />

      <header className="z-10 mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Pomofocus
        </h1>
        <p className="mt-1 text-sm text-white/50">Focus. Break. Repeat.</p>
      </header>

      <div className="card-3d z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        {/* Mode tabs */}
        <div className="mb-8 flex gap-1.5 rounded-full bg-black/20 p-1.5">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-full px-2 py-2 text-xs font-semibold transition-all sm:text-sm ${
                mode === m
                  ? "text-white shadow-lg"
                  : "text-white/50 hover:text-white/80"
              }`}
              style={
                mode === m
                  ? {
                      background:
                        "linear-gradient(180deg, var(--accent-soft), var(--accent))",
                    }
                  : undefined
              }
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Circular timer */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
          <svg
            className="absolute h-full w-full -rotate-90"
            viewBox="0 0 300 300"
          >
            <circle
              cx="150"
              cy="150"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
            />
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
            onClick={() => setRunning((r) => !r)}
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

      {/* Session counter */}
      <p className="z-10 mt-7 text-sm text-white/50">
        <span className="font-bold text-white/80">{completed}</span> focus
        {completed === 1 ? " session" : " sessions"} completed today
      </p>
    </main>
  );
}
