"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { playAlarm } from "@/lib/audio";

type Mode = "focus" | "short" | "long";

const DISMISS_DELAY = 5; // seconds before "Not now" is clickable
const MOMENTUM_WINDOW = 15; // seconds for momentum boost
const CHIME_INTERVAL = 10; // seconds between repeating chimes
const HOLD_DURATION = 1500; // ms to hold the extend button

export default function SessionCompleteModal({
  open,
  kind,
  nextMode,
  onStartNext,
  onExtend,
  onDismiss,
  strictMode = false,
  soundOn = true,
  volume = 0.7,
}: {
  open: boolean;
  kind: "focus" | "break";
  nextMode: Mode;
  onStartNext: () => void;
  onExtend: () => void;
  onDismiss: () => void;
  strictMode?: boolean;
  soundOn?: boolean;
  volume?: number;
}) {
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

  // --- "Not now" countdown ---
  const [dismissCountdown, setDismissCountdown] = useState(DISMISS_DELAY);

  // --- Momentum boost (strict only) ---
  const [momentumLeft, setMomentumLeft] = useState(MOMENTUM_WINDOW);
  const [showMomentum, setShowMomentum] = useState(false);

  // --- Hold-to-extend (strict only) ---
  const holdProgress = useMotionValue(0);
  const holdPercent = useTransform(holdProgress, [0, 1], ["0%", "100%"]);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const [holdActive, setHoldActive] = useState(false);

  // Original title ref for restoring tab title
  const originalTitleRef = useRef<string>("");
  const titleFlashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const momentumTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (titleFlashRef.current) clearInterval(titleFlashRef.current);
    if (chimeIntervalRef.current) clearInterval(chimeIntervalRef.current);
    if (dismissTimerRef.current) clearInterval(dismissTimerRef.current);
    if (momentumTimerRef.current) clearInterval(momentumTimerRef.current);
    titleFlashRef.current = null;
    chimeIntervalRef.current = null;
    dismissTimerRef.current = null;
    momentumTimerRef.current = null;
    // Restore tab title
    document.title = originalTitleRef.current;
  }, []);

  useEffect(() => {
    if (!open) {
      clearAllTimers();
      setDismissCountdown(DISMISS_DELAY);
      setMomentumLeft(MOMENTUM_WINDOW);
      setShowMomentum(false);
      holdProgress.set(0);
      return;
    }

    // Save original title
    originalTitleRef.current = document.title;

    // --- "Not now" countdown ---
    setDismissCountdown(DISMISS_DELAY);
    dismissTimerRef.current = setInterval(() => {
      setDismissCountdown((n) => {
        if (n <= 1) {
          if (dismissTimerRef.current) clearInterval(dismissTimerRef.current);
          return 0;
        }
        return n - 1;
      });
    }, 1000);

    // --- Tab title flash ---
    let flashState = false;
    titleFlashRef.current = setInterval(() => {
      document.title = flashState ? "⏰ Action needed — Tomo" : originalTitleRef.current;
      flashState = !flashState;
    }, 1500);

    // --- Strict Mode: repeating chime every CHIME_INTERVAL seconds ---
    if (strictMode && soundOn) {
      chimeIntervalRef.current = setInterval(() => {
        playAlarm(kind === "focus" ? "focusEnd" : "breakEnd", volume * 0.6);
      }, CHIME_INTERVAL * 1000);
    }

    // --- Strict Mode: momentum countdown ---
    if (strictMode) {
      setMomentumLeft(MOMENTUM_WINDOW);
      momentumTimerRef.current = setInterval(() => {
        setMomentumLeft((n) => {
          if (n <= 1) {
            if (momentumTimerRef.current) clearInterval(momentumTimerRef.current);
            return 0;
          }
          return n - 1;
        });
      }, 1000);
    }

    return () => clearAllTimers();
  }, [open, strictMode, soundOn, volume, kind, clearAllTimers, holdProgress]);

  // Handle Start — check for momentum boost first
  const handleStartNext = () => {
    const gotMomentum = strictMode && momentumLeft > 0;
    clearAllTimers();
    if (gotMomentum) {
      setShowMomentum(true);
      setTimeout(() => {
        setShowMomentum(false);
        onStartNext();
      }, 1200);
    } else {
      onStartNext();
    }
  };

  // Handle dismiss — only fires when countdown is 0
  const handleDismiss = () => {
    if (dismissCountdown > 0) return;
    clearAllTimers();
    onDismiss();
  };

  // --- Hold-to-extend logic ---
  const startHold = () => {
    if (!strictMode) return;
    setHoldActive(true);
    holdAnimRef.current = animate(holdProgress, 1, {
      duration: HOLD_DURATION / 1000,
      ease: "linear",
    });
    holdTimerRef.current = setTimeout(() => {
      clearAllTimers();
      onExtend();
      holdProgress.set(0);
      setHoldActive(false);
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (!strictMode) return;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdAnimRef.current) holdAnimRef.current.stop();
    animate(holdProgress, 0, { duration: 0.2, ease: "easeOut" });
    setHoldActive(false);
  };

  const handleExtendClick = () => {
    if (!strictMode) {
      clearAllTimers();
      onExtend();
    }
    // In strict mode, handled by hold gestures
  };

  // Momentum ring circumference
  const momentumRadius = 16;
  const momentumCircumference = 2 * Math.PI * momentumRadius;
  const momentumDash = strictMode
    ? (momentumLeft / MOMENTUM_WINDOW) * momentumCircumference
    : 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
          {/* Backdrop — no onClick, intentionally locked */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
            // One-shot shake on open
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: [0, -10, 10, -7, 7, -4, 4, 0],
            }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { type: "spring", stiffness: 360, damping: 26 },
              y: { type: "spring", stiffness: 360, damping: 26 },
              x: { duration: 0.45, ease: "easeOut", delay: 0.1 },
            }}
          >
            {/* Momentum boost flash */}
            <AnimatePresence>
              {showMomentum && (
                <motion.div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl"
                  style={{ background: "linear-gradient(135deg, #f97362cc, #6d8bffcc)" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="text-4xl">⚡</span>
                  <p className="mt-2 text-lg font-bold text-white">Momentum!</p>
                  <p className="text-sm text-white/80">You&apos;re in the zone.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{message}</p>

            {/* Strict: momentum countdown ring */}
            {strictMode && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                  <circle
                    cx="20" cy="20" r={momentumRadius}
                    fill="none"
                    strokeWidth="2.5"
                    className="stroke-border"
                  />
                  <motion.circle
                    cx="20" cy="20" r={momentumRadius}
                    fill="none"
                    strokeWidth="2.5"
                    stroke="var(--accent)"
                    strokeLinecap="round"
                    strokeDasharray={momentumCircumference}
                    strokeDashoffset={momentumCircumference - momentumDash}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <span className="text-xs text-muted">
                  {momentumLeft > 0
                    ? `Start in ${momentumLeft}s for ⚡ Momentum`
                    : "Momentum window passed"}
                </span>
              </div>
            )}

            <div className="mt-5 space-y-2.5">
              <button
                id="session-start-next-btn"
                onClick={handleStartNext}
                className="press btn-primary w-full rounded-full py-3.5 text-sm font-bold"
              >
                {startLabel}
              </button>

              {/* Extend button — hold-to-extend in strict mode, normal click otherwise */}
              <div className="relative overflow-hidden rounded-full">
                <button
                  id="session-extend-btn"
                  onClick={handleExtendClick}
                  onMouseDown={strictMode ? startHold : undefined}
                  onMouseUp={strictMode ? cancelHold : undefined}
                  onMouseLeave={strictMode ? cancelHold : undefined}
                  onTouchStart={strictMode ? startHold : undefined}
                  onTouchEnd={strictMode ? cancelHold : undefined}
                  className="press relative w-full rounded-full border border-border bg-surface2 py-3 text-sm font-semibold select-none"
                >
                  {strictMode ? (
                    <span className="flex items-center justify-center gap-1.5">
                      {holdActive ? "Hold…" : extendLabel}
                      <span className="text-xs text-faint">{strictMode && !holdActive ? "— hold" : ""}</span>
                    </span>
                  ) : (
                    extendLabel
                  )}
                </button>
                {/* Hold progress bar (strict only) */}
                {strictMode && (
                  <motion.div
                    className="pointer-events-none absolute bottom-0 left-0 h-full rounded-full"
                    style={{
                      width: holdPercent,
                      background: "linear-gradient(90deg, var(--accent-soft), var(--accent))",
                      opacity: 0.25,
                    }}
                  />
                )}
              </div>
            </div>

            {/* "Not now" — locked for DISMISS_DELAY seconds */}
            <button
              id="session-not-now-btn"
              onClick={handleDismiss}
              disabled={dismissCountdown > 0}
              className="mt-3 text-xs transition-all"
              style={{
                color: dismissCountdown > 0 ? "var(--faint)" : "var(--muted)",
                cursor: dismissCountdown > 0 ? "not-allowed" : "pointer",
              }}
            >
              {dismissCountdown > 0 ? `Not now (${dismissCountdown})` : "Not now"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
