"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import Sheet from "./Sheet";

const PERKS = [
  { icon: "📊", text: "Export your focus stats as CSV", live: true },
  { icon: "🌬️", text: "Premium breathing patterns (5-5 & Deep)", live: true },
  { icon: "🎧", text: "Upload your own focus sounds", live: false },
  { icon: "🎨", text: "Custom accent themes", live: false },
  { icon: "☁️", text: "Sync your Focus Garden across devices", live: false },
];

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
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tomo Premium"
      subtitle={active ? "You're an early member 🎉" : "Free during the beta"}
    >
      <div
        className="mb-4 flex items-center gap-3 rounded-2xl p-4 text-white"
        style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--accent))" }}
      >
        <Sparkles size={24} />
        <div>
          <p className="text-sm font-bold">
            {active ? "Premium is active" : "Unlock Premium, free in beta"}
          </p>
          <p className="text-xs text-white/80">
            {active ? "Your live perks are unlocked." : "Two perks work today — more during the beta."}
          </p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {PERKS.map((p) => (
          <li key={p.text} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-lg">
              {p.icon}
            </span>
            <span className="flex-1 text-sm">{p.text}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                p.live ? "bg-surface text-accent" : "bg-surface text-faint"
              }`}
            >
              {p.live ? (active ? "Active" : "Included") : "Soon"}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-xs text-faint">
        Perks marked Active work now. The rest roll out during the beta — free for early members.
      </p>

      {active ? (
        <div className="mt-4 flex gap-3">
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
          className="press btn-primary mt-4 w-full rounded-2xl py-3.5 text-sm font-bold"
        >
          Activate Premium — Free
        </motion.button>
      )}
    </Sheet>
  );
}
