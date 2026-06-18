"use client";

import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
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
}: {
  open: boolean;
  onClose: () => void;
  active: boolean;
  onActivate: () => void;
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
            {active ? "Premium is active" : "Unlock everything, free in beta"}
          </p>
          <p className="text-xs text-white/80">
            {active
              ? "Thanks for being an early supporter."
              : "Lock in these perks as an early member."}
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
            {active ? <Check size={18} className="shrink-0 text-accent" /> : null}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-xs text-faint">
        These features roll out during the beta. Activating now keeps them free for you.
      </p>

      {active ? (
        <button
          onClick={onClose}
          className="press mt-4 w-full rounded-2xl bg-surface2 py-3 text-sm font-semibold"
        >
          Done
        </button>
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
