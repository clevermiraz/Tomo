"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Music, Play, RotateCcw } from "lucide-react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import SettingsModal from "./components/SettingsModal";
import SoundPanel, {
  DEFAULT_TRACK_ID,
  type SoundControls,
  type SoundState,
} from "./components/SoundPanel";
import GardenModal from "./components/GardenModal";
import PremiumModal from "./components/PremiumModal";
import ConfirmDialog from "./components/ConfirmDialog";
import InstallPrompt from "./components/InstallPrompt";
import FocusTimer from "./components/FocusTimer";
import QuickNap from "./components/QuickNap";
import Breathwork from "./components/Breathwork";
import Segmented from "./components/Segmented";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";
import { resumeAudio } from "@/lib/audio";
import {
  DEFAULT_GARDEN,
  addSession,
  computeStreak,
  dayKey,
  todaySessions,
  type GardenData,
} from "@/lib/garden";
import type { Tool, ToolProps } from "@/lib/tools";

const TOOLS: { key: Tool; label: string }[] = [
  { key: "focus", label: "Focus Timer" },
  { key: "nap", label: "Quick Nap" },
  { key: "breathe", label: "Breathwork" },
];

export default function Home() {
  const [settings, setSettings] = useLocalStorage<Settings>("tomo-settings", DEFAULT_SETTINGS);
  const [garden, setGarden] = useLocalStorage<GardenData>("tomo-garden", DEFAULT_GARDEN);
  const [premium, setPremium] = useLocalStorage("tomo-premium", false);
  const [tool, setTool] = useState<Tool>("focus");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [gardenOpen, setGardenOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [toolRunning, setToolRunning] = useState(false);
  const [pendingTool, setPendingTool] = useState<Tool | null>(null);
  const [sound, setSound] = useState<SoundState>({ activeId: null, name: null, vibe: null, icon: null });
  const [celebrate, setCelebrate] = useState<{ key: number; count: number; streak: number } | null>(null);

  // ── Pull-to-refresh (PWA only) ───────────────────────────────────────────
  const [isPWA, setIsPWA] = useState(false);
  const [pullDist, setPullDist] = useState(0);   // visual distance (capped, resisted)
  const [pendingReload, setPendingReload] = useState(false);
  const pullDistRef = useRef(0);
  const toolRunningRef = useRef(false);           // ref so touch handlers read live value

  useEffect(() => { toolRunningRef.current = toolRunning; }, [toolRunning]);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsPWA(mq.matches);
  }, []);

  useEffect(() => {
    if (!isPWA) return;

    let active = false;
    let startY = 0;
    const THRESHOLD = 60; // px (visual) before release triggers reload

    const onTouchStart = (e: TouchEvent) => {
      // Only start a pull gesture when already at the top of the page
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        active = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active) return;
      const rawDist = e.touches[0].clientY - startY;
      if (rawDist > 0) {
        e.preventDefault(); // block native scroll bounce
        // Rubber-band resistance: finger travels 2× further than the indicator moves
        const visual = Math.min(rawDist * 0.5, 80);
        pullDistRef.current = visual;
        setPullDist(visual);
      } else {
        // Scrolling up — cancel
        active = false;
        pullDistRef.current = 0;
        setPullDist(0);
      }
    };

    const onTouchEnd = () => {
      if (!active) return;
      active = false;
      const dist = pullDistRef.current;
      pullDistRef.current = 0;
      setPullDist(0);

      if (dist >= THRESHOLD) {
        if (toolRunningRef.current) {
          // Timer is running — confirm before reloading
          setPendingReload(true);
        } else {
          window.location.reload();
        }
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPWA]);

  // Switching tools while a timer runs will stop it — warn first.
  const requestTool = (next: Tool) => {
    if (next === tool) return;
    if (toolRunning) setPendingTool(next);
    else setTool(next);
  };

  // Warn before closing/refreshing the tab while a timer is running.
  useEffect(() => {
    if (!toolRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [toolRunning]);

  const soundControls = useRef<SoundControls>({});

  const today = dayKey();
  const todayCount = todaySessions(garden, today);
  const streak = computeStreak(garden.days, today);

  const onStart = () => {
    resumeAudio();
    if (settings.defaultMusic) soundControls.current.playDefault?.();
  };

  const onFocusComplete = (minutes: number) => {
    // Functional update keeps the count correct even across rapid auto-starts.
    setGarden((prev) => addSession(prev, minutes, today));
    const next = addSession(garden, minutes, today);
    const count = next.days[today].sessions;
    setCelebrate({ key: count, count, streak: computeStreak(next.days, today) });
  };

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(null), 2800);
    return () => clearTimeout(t);
  }, [celebrate]);

  const toggleMusic = () => {
    resumeAudio();
    soundControls.current.toggleById?.(sound.activeId ?? DEFAULT_TRACK_ID);
  };
  const cycle = (dir: 1 | -1) => {
    resumeAudio();
    soundControls.current.cycle?.(dir);
  };

  const playing = sound.activeId != null;

  const miniPlayer = (
    <div className="mt-5 flex items-center gap-2 rounded-2xl bg-surface2 p-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => cycle(-1)}
        aria-label="Previous sound"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted hover:text-fg"
      >
        <ChevronLeft size={18} />
      </motion.button>

      <button
        onClick={() => setSoundOpen(true)}
        className="flex min-w-0 flex-1 items-center gap-2.5"
        aria-label="Browse focus sounds"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-lg">
          {sound.icon ?? <Music size={18} className="text-muted" />}
        </span>
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-semibold">{sound.name ?? "Focus music"}</span>
          <span className="block truncate text-xs text-faint">
            {playing ? "Now playing" : "Tap to choose"}
          </span>
        </span>
      </button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => cycle(1)}
        aria-label="Next sound"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted hover:text-fg"
      >
        <ChevronRight size={18} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggleMusic}
        aria-label={playing ? "Pause music" : "Play music"}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }}
      >
        {playing ? (
          <span className="flex items-end gap-[3px]" aria-hidden>
            <span className="eq-bar h-4 w-[3px] rounded-full bg-white" />
            <span className="eq-bar eq-bar-2 h-4 w-[3px] rounded-full bg-white" />
            <span className="eq-bar eq-bar-3 h-4 w-[3px] rounded-full bg-white" />
          </span>
        ) : (
          <Play size={18} fill="currentColor" />
        )}
      </motion.button>
    </div>
  );

  const toolProps: ToolProps = {
    settings,
    onOpenSettings: () => setSettingsOpen(true),
    soundControls,
    miniPlayer,
    onStart,
    onFocusComplete,
    todayCount,
    streak,
    active: true,
    onRunningChange: setToolRunning,
    premium,
    onUpgrade: () => setPremiumOpen(true),
  };

  return (
    <>
      {/* ── Pull-to-refresh indicator (PWA only) ─────────────────────── */}
      {isPWA && pullDist > 0 && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[300] flex justify-center"
          style={{ transform: `translateY(${pullDist - 44}px)`, opacity: pullDist / 60 }}
        >
          <div className="surface flex h-11 w-11 items-center justify-center rounded-full">
            <motion.div
              animate={{ rotate: pullDist >= 60 ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <RotateCcw size={18} className="text-accent" />
            </motion.div>
          </div>
        </div>
      )}
      <SiteHeader
        onOpenGarden={() => setGardenOpen(true)}
        streak={streak}
        onOpenPremium={() => setPremiumOpen(true)}
        premium={premium}
      />

      <div className="flex min-h-dvh flex-col">
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-20">
          <header className="z-10 mb-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Tomo</h1>
            <p className="mt-1 text-sm text-muted">Your focus friend</p>
          </header>

          <div className="z-10 mb-5 w-full max-w-md">
            <Segmented
              items={TOOLS.map((t) => ({ key: t.key, label: t.label }))}
              value={tool}
              onChange={(k) => requestTool(k as Tool)}
              containerClassName="surface"
            />
          </div>

          {tool === "focus" && <FocusTimer {...toolProps} />}
          {tool === "nap" && <QuickNap {...toolProps} />}
          {tool === "breathe" && <Breathwork {...toolProps} />}
        </main>
        <SiteFooter />
      </div>

      {/* Session-complete celebration */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            key={celebrate.key}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="surface fixed inset-x-0 bottom-6 z-[70] mx-auto flex w-fit items-center gap-3 rounded-full px-5 py-3"
          >
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 14 }}
              className="text-2xl"
            >
              🍅
            </motion.span>
            <span className="text-sm font-semibold">
              Tomato ripened! · <span aria-hidden>🔥</span> {celebrate.streak} day streak
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        premium={premium}
        onUpgrade={() => setPremiumOpen(true)}
      />
      <SoundPanel
        open={soundOpen}
        onClose={() => setSoundOpen(false)}
        volume={settings.volume}
        autoplayFocus={settings.autoplayFocus}
        onAutoplayChange={(v) => setSettings({ ...settings, autoplayFocus: v })}
        registerControls={(c) => (soundControls.current = c)}
        onState={setSound}
      />
      <GardenModal
        open={gardenOpen}
        onClose={() => setGardenOpen(false)}
        garden={garden}
        dailyGoal={settings.dailyGoal}
        premium={premium}
        onUpgrade={() => setPremiumOpen(true)}
      />
      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        active={premium}
        onActivate={() => setPremium(true)}
        onDeactivate={() => setPremium(false)}
      />
      <ConfirmDialog
        open={pendingTool !== null}
        title="Timer is running"
        message="Leaving this tab will stop your current timer. Leave anyway?"
        confirmLabel="Leave"
        cancelLabel="Go back"
        onConfirm={() => {
          if (pendingTool) setTool(pendingTool);
          setPendingTool(null);
        }}
        onCancel={() => setPendingTool(null)}
      />
      <ConfirmDialog
        open={pendingReload}
        title="Timer is running"
        message="Refreshing will stop your current timer. Refresh anyway?"
        confirmLabel="Refresh"
        cancelLabel="Go back"
        onConfirm={() => { setPendingReload(false); window.location.reload(); }}
        onCancel={() => setPendingReload(false)}
      />
      <InstallPrompt />
    </>
  );
}
