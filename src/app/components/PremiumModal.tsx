"use client";

import { motion } from "motion/react";
import { Sparkles, Check } from "lucide-react";
import Sheet from "./Sheet";

/* ─── Data ─────────────────────────────────────────────────────────────── */

type Perk = {
  icon: string;
  title: string;
  desc: string;
  live: boolean;
};

const PERKS: Perk[] = [
  {
    icon: "🔒",
    title: "Strict Mode",
    desc: "Hold-to-extend, momentum rewards & repeating alerts — stay locked in.",
    live: true,
  },
  {
    icon: "📊",
    title: "Focus Stats Export",
    desc: "Download your session history as a CSV anytime.",
    live: true,
  },
  {
    icon: "🌬️",
    title: "Premium Breathwork",
    desc: "Unlock 5-5 box and deep-belly breathing patterns.",
    live: true,
  },
  {
    icon: "🎧",
    title: "Custom Sounds",
    desc: "Upload your own focus audio to the sound panel.",
    live: false,
  },
  {
    icon: "🎨",
    title: "Custom Themes",
    desc: "Pick your own accent colour across the whole app.",
    live: false,
  },
  {
    icon: "☁️",
    title: "Garden Sync",
    desc: "Keep your streak in sync across all your devices.",
    live: false,
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function PremiumModal({
  open,
  onClose,
  active,
  onActivate,
  onDeactivate,
}: {
  open: boolean;
  onClose: () => void;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const livePerks = PERKS.filter((p) => p.live);
  const soonPerks = PERKS.filter((p) => !p.live);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tomo Premium"
      subtitle={active ? "You're an early member 🎉" : "Free during the beta"}
    >
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div
        className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3.5 text-white"
        style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--accent))" }}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">
            {active ? "Premium active" : "Unlock Premium — it's free"}
          </p>
          <p className="text-xs text-white/75">
            {active ? "All live perks are yours." : "All live perks available now, more coming soon."}
          </p>
        </div>
      </div>

      {/* ── Live perks ──────────────────────────────────────────────────── */}
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
        What you get
      </p>
      <ul className="space-y-2">
        {livePerks.map((p) => (
          <li
            key={p.title}
            className="flex items-center gap-3 rounded-2xl bg-surface2 p-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-lg">
              {p.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{p.title}</p>
              <p className="truncate text-xs text-muted">{p.desc}</p>
            </div>
            {active && (
              <span className="shrink-0 text-accent">
                <Check size={15} strokeWidth={2.5} />
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* ── Coming soon ─────────────────────────────────────────────────── */}
      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-faint">
        Coming soon
      </p>
      <ul className="space-y-2">
        {soonPerks.map((p) => (
          <li
            key={p.title}
            className="flex items-center gap-3 rounded-2xl bg-surface2 p-3 opacity-50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-lg">
              {p.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{p.title}</p>
              <p className="truncate text-xs text-muted">{p.desc}</p>
            </div>
            <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-faint">
              Soon
            </span>
          </li>
        ))}
      </ul>

      {active && (
        <p className="mt-3 text-center text-xs text-faint">
          Strict Mode → Settings → Focus Discipline
        </p>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      {active ? (
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="press flex-1 rounded-2xl bg-surface2 py-3 text-sm font-semibold"
          >
            Done
          </button>
          <button
            onClick={onDeactivate}
            className="press flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-muted"
          >
            Deactivate
          </button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onActivate}
          className="press btn-primary mt-5 w-full rounded-2xl py-3.5 text-sm font-bold"
        >
          Activate Premium — Free
        </motion.button>
      )}
    </Sheet>
  );
}
