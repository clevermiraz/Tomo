"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Settings } from "lucide-react";
import Segmented from "./Segmented";
import { applyTheme, type ToolProps } from "@/lib/tools";
import { playBreathCue } from "@/lib/audio";

type Kind = "in" | "out" | "hold";
type Phase = { kind: Kind; s: number; scale: number };

const PATTERNS: Record<string, { name: string; hint: string; phases: Phase[] }> = {
  "478": {
    name: "4-7-8",
    hint: "Dr. Weil's relaxing breath — great before sleep.",
    phases: [
      { kind: "in", s: 4, scale: 1 },
      { kind: "hold", s: 7, scale: 1 },
      { kind: "out", s: 8, scale: 0.5 },
    ],
  },
  box: {
    name: "Box",
    hint: "Equal breathing to steady the mind — 4·4·4·4.",
    phases: [
      { kind: "in", s: 4, scale: 1 },
      { kind: "hold", s: 4, scale: 1 },
      { kind: "out", s: 4, scale: 0.5 },
      { kind: "hold", s: 4, scale: 0.5 },
    ],
  },
  calm: {
    name: "Calm",
    hint: "Longer exhales to ease stress — 4 in, 6 out.",
    phases: [
      { kind: "in", s: 4, scale: 1 },
      { kind: "out", s: 6, scale: 0.5 },
    ],
  },
};

const LABEL: Record<Kind, string> = { in: "Inhale", out: "Exhale", hold: "Hold" };
const THEME = { accent: "#3ecf8e", soft: "#6fe3ab", glow: "62, 207, 142" };

// Calm full-screen scene background.
const SCENE_BG =
  "radial-gradient(80% 55% at 50% 26%, rgba(120,168,142,0.55), transparent 70%)," +
  "linear-gradient(180deg, #6c8a78 0%, #5a7567 52%, #4b625a 100%)";

// Static floating particles (deterministic — no hydration risk).
const PARTICLES = [
  { left: "18%", top: "30%", size: 3, dur: 11, delay: 0 },
  { left: "72%", top: "22%", size: 2, dur: 14, delay: 2 },
  { left: "30%", top: "62%", size: 4, dur: 13, delay: 1 },
  { left: "82%", top: "55%", size: 2, dur: 16, delay: 4 },
  { left: "55%", top: "70%", size: 3, dur: 12, delay: 3 },
  { left: "12%", top: "48%", size: 2, dur: 15, delay: 5 },
  { left: "63%", top: "38%", size: 2, dur: 13, delay: 1.5 },
  { left: "44%", top: "20%", size: 3, dur: 17, delay: 2.5 },
  { left: "88%", top: "40%", size: 2, dur: 14, delay: 6 },
  { left: "25%", top: "78%", size: 3, dur: 12, delay: 3.5 },
];

function mmss(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Breathwork({ settings, onOpenSettings, miniPlayer, onStart }: ToolProps) {
  const [patternKey, setPatternKey] = useState<keyof typeof PATTERNS>("box");
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const phaseStartRef = useRef(0);
  const phaseIndexRef = useRef(0);
  const sessionStartRef = useRef(0);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pattern = PATTERNS[patternKey];
  const phases = pattern.phases;
  const current = phases[phaseIndex];

  useEffect(() => {
    applyTheme(THEME.accent, THEME.soft, THEME.glow);
  }, []);

  // Phase machine + breathing tones.
  useEffect(() => {
    if (!running) return;
    const cue = (p: Phase) => {
      if (p.kind !== "hold" && settings.soundOn) playBreathCue(p.kind, p.s, settings.volume);
    };
    cue(phases[phaseIndexRef.current]);
    phaseStartRef.current = Date.now();

    const id = setInterval(() => {
      const cur = phases[phaseIndexRef.current];
      const e = (Date.now() - phaseStartRef.current) / 1000;
      if (e >= cur.s) {
        let next = phaseIndexRef.current + 1;
        if (next >= phases.length) {
          next = 0;
          setCycles((c) => c + 1);
        }
        phaseIndexRef.current = next;
        phaseStartRef.current = Date.now();
        setPhaseIndex(next);
        cue(phases[next]);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternKey]);

  // Elapsed timer.
  useEffect(() => {
    if (!running) return;
    sessionStartRef.current = Date.now();
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000)),
      250
    );
    return () => clearInterval(id);
  }, [running]);

  // Scroll-lock + Escape while immersive.
  useEffect(() => {
    if (!running) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRunning(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [running]);

  const selectPattern = (k: keyof typeof PATTERNS) => {
    setRunning(false);
    setPatternKey(k);
    phaseIndexRef.current = 0;
    setPhaseIndex(0);
    setCycles(0);
  };

  const start = () => {
    onStart();
    phaseIndexRef.current = 0;
    setPhaseIndex(0);
    setCycles(0);
    setElapsed(0);
    setRunning(true);
  };

  const startHold = () => {
    holdRef.current = setTimeout(() => setRunning(false), 650);
  };
  const cancelHold = () => {
    if (holdRef.current) clearTimeout(holdRef.current);
    holdRef.current = null;
  };

  return (
    <>
      <div className="surface z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="h-10 w-10" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-faint">Breathwork</span>
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
            items={(Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]).map((k) => ({
              key: k,
              label: PATTERNS[k].name,
            }))}
            value={patternKey}
            onChange={(k) => selectPattern(k as keyof typeof PATTERNS)}
          />
        </div>

        {/* Preview orb */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
          <div
            className="absolute h-1/2 w-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle at 50% 40%, var(--accent-soft), var(--accent))",
              boxShadow: "0 0 60px -10px rgba(var(--glow), 0.7)",
            }}
          />
          <span className="z-10 text-2xl font-bold text-white drop-shadow">Breathe</span>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={start}
            className="press btn-primary min-w-[180px] rounded-full px-8 py-4 text-base font-bold"
          >
            Start breathing
          </button>
        </div>

        {miniPlayer}
      </div>

      <p className="z-10 mt-7 max-w-xs text-center text-sm text-muted">{pattern.hint}</p>

      {/* Immersive breathing scene */}
      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[80] flex select-none flex-col items-center justify-center overflow-hidden text-white"
            style={{ background: SCENE_BG }}
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
          >
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  left: p.left,
                  top: p.top,
                  height: p.size,
                  width: p.size,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}

            {/* Breathing orb */}
            <div className="relative flex h-[300px] w-[300px] items-center justify-center">
              <div
                className="absolute h-64 w-64 rounded-full"
                style={{
                  transform: `scale(${current.scale * 1.15})`,
                  transition: `transform ${current.s}s ease-in-out`,
                  background:
                    "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.55), rgba(255,255,255,0.14))",
                  boxShadow: "0 0 90px rgba(255,255,255,0.3)",
                }}
              />
              <motion.span
                key={current.kind + phaseIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 text-2xl font-medium tracking-wide"
              >
                {LABEL[current.kind]}
              </motion.span>
            </div>

            <div className="absolute bottom-20 flex flex-col items-center gap-2">
              <span className="tabular text-4xl font-light">{mmss(elapsed)}</span>
              <span className="text-sm text-white/55">
                {cycles} {cycles === 1 ? "cycle" : "cycles"} · Long press to end
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
