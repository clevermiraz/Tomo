"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

type Mode = "focus" | "short" | "long";

export default function SessionCompleteModal({
  open,
  kind,
  nextMode,
  onStartNext,
  onExtend,
  onDismiss,
}: {
  open: boolean;
  kind: "focus" | "break";
  nextMode: Mode;
  onStartNext: () => void;
  onExtend: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  const isFocus = kind === "focus";
  const title = isFocus ? "Focus complete 🎉" : "Break's over 🌿";
  const message = isFocus
    ? nextMode === "long"
      ? "Great work — time for a long break."
      : "Great work — time for a short break."
    : "Ready to focus again?";
  const startLabel = isFocus
    ? `Start ${nextMode === "long" ? "Long" : "Short"} Break`
    : "Start Focus";
  const extendLabel = isFocus ? "+5 min focus" : "+5 min break";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="surface relative z-10 w-full max-w-sm rounded-3xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
          >
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{message}</p>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={onStartNext}
                className="press btn-primary w-full rounded-full py-3.5 text-sm font-bold"
              >
                {startLabel}
              </button>
              <button
                onClick={onExtend}
                className="press w-full rounded-full border border-border bg-surface2 py-3 text-sm font-semibold"
              >
                {extendLabel}
              </button>
            </div>

            <button
              onClick={onDismiss}
              className="mt-3 text-xs text-faint transition-colors hover:text-fg"
            >
              Not now
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
