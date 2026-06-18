"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="surface relative z-10 w-full max-w-sm rounded-3xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{message}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={onCancel}
                className="press flex-1 rounded-full bg-surface2 py-3 text-sm font-semibold"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="press btn-primary flex-1 rounded-full py-3 text-sm font-bold"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
