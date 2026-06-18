"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import Sheet from "./Sheet";

const PERKS = [
  { icon: "🎧", text: "Expanded sound library & upload your own tracks" },
  { icon: "🎨", text: "Custom accent themes for the whole app" },
  { icon: "📊", text: "Advanced stats, full history & CSV export" },
  { icon: "☁️", text: "Sync your Focus Garden across devices" },
  { icon: "🌙", text: "Premium breathing & guided sleep programs" },
  { icon: "❤️", text: "Support Tomo's development" },
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
      subtitle={active ? "You're an early member 🎉" : "Coming soon — reserve free in beta"}
    >
      <div
        className="mb-4 flex items-center gap-3 rounded-2xl p-4 text-white"
        style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--accent))" }}
      >
        <Sparkles size={24} />
        <div>
          <p className="text-sm font-bold">
            {active ? "You're an early member" : "Reserve premium, free in beta"}
          </p>
          <p className="text-xs text-white/80">
            These perks aren&apos;t live yet — they roll out during the beta.
          </p>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">On the roadmap</p>
      <ul className="space-y-2.5">
        {PERKS.map((p) => (
          <li key={p.text} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-lg">
              {p.icon}
            </span>
            <span className="flex-1 text-sm">{p.text}</span>
            <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-faint">
              Soon
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-xs text-faint">
        Nothing is unlocked yet. Activating reserves these perks free for you as an early member.
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
