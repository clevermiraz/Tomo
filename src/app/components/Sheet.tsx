"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Animated modal / bottom-sheet shell with built-in accessibility:
 * Escape-to-close, body scroll lock, and dialog ARIA. Animates in/out
 * with Motion (slides up on mobile, scales in on desktop).
 */
export default function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="surface scroll-area relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-7 sm:rounded-3xl sm:p-6"
            initial={{ y: 36, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface2 text-muted"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
