import type { ReactNode } from "react";

const R = 130;
const C = 2 * Math.PI * R;

/** Shared circular progress ring used by the Focus and Nap timers. */
export default function TimerRing({
  progress,
  children,
}: {
  progress: number;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r={R - 7} fill="var(--ring-fill)" />
        <circle cx="150" cy="150" r={R} fill="none" stroke="var(--ring-track)" strokeWidth="14" />
        <circle
          cx="150"
          cy="150"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{
            transition: "stroke-dashoffset 0.4s linear",
            filter: "drop-shadow(0 0 10px rgba(var(--glow), 0.8))",
          }}
        />
      </svg>
      <div className="z-10 flex flex-col items-center">{children}</div>
    </div>
  );
}
