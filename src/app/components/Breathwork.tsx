"use client";

import { useEffect, useRef, useState } from "react";
import { applyTheme, type ToolProps } from "@/lib/tools";

type Phase = { label: string; s: number; scale: number };

const PATTERNS: Record<string, { name: string; hint: string; phases: Phase[] }> = {
  box: {
    name: "Box",
    hint: "Equal breathing to steady the mind — 4·4·4·4.",
    phases: [
      { label: "Breathe in", s: 4, scale: 1 },
      { label: "Hold", s: 4, scale: 1 },
      { label: "Breathe out", s: 4, scale: 0.55 },
      { label: "Hold", s: 4, scale: 0.55 },
    ],
  },
  "478": {
    name: "4-7-8",
    hint: "Dr. Weil's relaxing breath — great before sleep.",
    phases: [
      { label: "Breathe in", s: 4, scale: 1 },
      { label: "Hold", s: 7, scale: 1 },
      { label: "Breathe out", s: 8, scale: 0.55 },
    ],
  },
  calm: {
    name: "Calm",
    hint: "Longer exhales to ease stress — 4 in, 6 out.",
    phases: [
      { label: "Breathe in", s: 4, scale: 1 },
      { label: "Breathe out", s: 6, scale: 0.55 },
    ],
  },
};

const THEME = { accent: "#34d8c0", soft: "#6ff0dd", glow: "52, 216, 192" };

export default function Breathwork({ onOpenSettings, miniPlayer, onStart }: ToolProps) {
  const [patternKey, setPatternKey] = useState<keyof typeof PATTERNS>("box");
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(PATTERNS.box.phases[0].s);
  const [cycles, setCycles] = useState(0);

  const phaseStartRef = useRef(0);
  const phaseIndexRef = useRef(0);

  const pattern = PATTERNS[patternKey];
  const phases = pattern.phases;

  useEffect(() => {
    applyTheme(THEME.accent, THEME.soft, THEME.glow);
  }, []);

  useEffect(() => {
    if (!running) return;
    phaseStartRef.current = Date.now();
    const id = setInterval(() => {
      const cur = phases[phaseIndexRef.current];
      const elapsed = (Date.now() - phaseStartRef.current) / 1000;
      if (elapsed >= cur.s) {
        let next = phaseIndexRef.current + 1;
        if (next >= phases.length) {
          next = 0;
          setCycles((c) => c + 1);
        }
        phaseIndexRef.current = next;
        phaseStartRef.current = Date.now();
        setPhaseIndex(next);
        setPhaseLeft(phases[next].s);
      } else {
        setPhaseLeft(Math.ceil(cur.s - elapsed));
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternKey]);

  useEffect(() => {
    document.title = running ? "Breathe — Tomo" : "Breathwork — Tomo";
  }, [running]);

  const selectPattern = (k: keyof typeof PATTERNS) => {
    setRunning(false);
    setPatternKey(k);
    phaseIndexRef.current = 0;
    setPhaseIndex(0);
    setPhaseLeft(PATTERNS[k].phases[0].s);
    setCycles(0);
  };

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    onStart();
    phaseIndexRef.current = 0;
    setPhaseIndex(0);
    setPhaseLeft(phases[0].s);
    setCycles(0);
    setRunning(true);
  };

  const scale = running ? phases[phaseIndex].scale : 0.55;
  const dur = running ? phases[phaseIndex].s : 0.6;

  return (
    <>
      <div className="surface z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="h-10 w-10" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
            Breathwork
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
          {(Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]).map((k) => (
            <button
              key={k}
              onClick={() => selectPattern(k)}
              className={`press flex-1 rounded-full py-2 text-xs font-semibold sm:text-sm ${
                patternKey === k ? "text-white" : "text-muted hover:text-fg"
              }`}
              style={
                patternKey === k
                  ? { background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }
                  : undefined
              }
            >
              {PATTERNS[k].name}
            </button>
          ))}
        </div>

        {/* Breathing orb */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
          <div
            className="absolute h-full w-full rounded-full ease-in-out"
            style={{
              transform: `scale(${scale})`,
              transitionProperty: "transform",
              transitionDuration: `${dur}s`,
              background: "radial-gradient(circle at 50% 40%, var(--accent-soft), var(--accent))",
              boxShadow: "0 0 60px -10px rgba(var(--glow), 0.8)",
            }}
          />
          <div className="z-10 flex flex-col items-center text-center text-white drop-shadow">
            <span className="text-2xl font-bold sm:text-3xl">
              {running ? phases[phaseIndex].label : "Breathe"}
            </span>
            <span className="tabular mt-1 text-5xl font-bold">
              {running ? phaseLeft : "·"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={toggle}
            className="press btn-primary min-w-[170px] rounded-full px-8 py-4 text-base font-bold"
          >
            {running ? "Stop" : "Start breathing"}
          </button>
        </div>

        {miniPlayer}
      </div>

      <p className="z-10 mt-7 max-w-xs text-center text-sm text-muted">
        {running ? `${cycles} ${cycles === 1 ? "cycle" : "cycles"} completed` : pattern.hint}
      </p>
    </>
  );
}
