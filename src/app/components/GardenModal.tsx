"use client";

import { motion } from "motion/react";
import { Flame, Trophy, Clock, Download, Lock } from "lucide-react";
import Sheet from "./Sheet";
import {
  dayKey,
  todaySessions,
  computeStreak,
  totals,
  lastNDays,
  type GardenData,
} from "@/lib/garden";

function StatChip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-surface2 p-3">
      <span className="text-accent">{icon}</span>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[11px] text-faint">{label}</span>
    </div>
  );
}

export default function GardenModal({
  open,
  onClose,
  garden,
  dailyGoal,
  premium,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  garden: GardenData;
  dailyGoal: number;
  premium: boolean;
  onUpgrade: () => void;
}) {
  const exportCsv = () => {
    if (!premium) {
      onUpgrade();
      return;
    }
    const rows = [["date", "sessions", "focus_minutes"]];
    Object.entries(garden.days)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, d]) => rows.push([date, String(d.sessions), String(d.minutes)]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tomo-focus-stats.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = dayKey();
  const todayN = todaySessions(garden, today);
  const streak = computeStreak(garden.days, today);
  const t = totals(garden.days);
  const week = lastNDays(garden.days, 7, today);
  const maxWeek = Math.max(1, ...week.map((d) => d.sessions));
  const goal = Number.isFinite(dailyGoal) && dailyGoal > 0 ? dailyGoal : 4;
  const plots = Math.max(goal, todayN);
  const remaining = Math.max(0, goal - todayN);
  const hours = Math.floor(t.minutes / 60);
  const mins = t.minutes % 60;

  return (
    <Sheet open={open} onClose={onClose} title="Focus Garden" subtitle="Grow tomatoes by focusing">
      <div className="flex gap-2.5">
        <StatChip icon={<Flame size={20} />} value={streak} label="day streak" />
        <StatChip icon={<span className="text-lg leading-none">🍅</span>} value={todayN} label="today" />
        <StatChip icon={<Trophy size={20} />} value={garden.bestStreak} label="best streak" />
      </div>

      {/* Garden patch */}
      <div className="mt-4 rounded-2xl bg-surface2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Today&apos;s harvest</span>
          <span className="text-xs text-faint">
            {remaining === 0 ? "Goal reached! 🎉" : `${remaining} to goal`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(plots, 16) }).map((_, i) => {
            const grown = i < todayN;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 500, damping: 20 }}
                className={`grid h-9 w-9 place-items-center rounded-full text-lg ${
                  grown ? "" : "bg-[var(--track)] text-faint"
                }`}
                style={
                  grown
                    ? { background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }
                    : undefined
                }
              >
                {grown ? "🍅" : "·"}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="mt-4 rounded-2xl bg-surface2 p-4">
        <span className="text-sm font-semibold">This week</span>
        <div className="mt-3 flex items-end justify-between gap-2" style={{ height: 88 }}>
          {week.map((d, i) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                initial={{ height: 4 }}
                animate={{ height: `${Math.max(6, (d.sessions / maxWeek) * 64)}px` }}
                transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 240, damping: 26 }}
                className="w-full rounded-full"
                style={{
                  background:
                    d.sessions > 0
                      ? "linear-gradient(180deg, var(--accent-soft), var(--accent))"
                      : "var(--track)",
                }}
              />
              <span className="text-[10px] text-faint">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-4 flex items-center justify-around rounded-2xl bg-surface2 p-4 text-center">
        <div>
          <p className="text-xl font-bold">{t.sessions}</p>
          <p className="text-[11px] text-faint">total sessions</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="flex items-center gap-1 text-xl font-bold">
            <Clock size={16} className="text-faint" />
            {hours}h {mins}m
          </p>
          <p className="text-[11px] text-faint">total focus</p>
        </div>
      </div>

      <button
        onClick={exportCsv}
        className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface2 py-3 text-sm font-semibold"
      >
        {premium ? <Download size={16} /> : <Lock size={15} className="text-faint" />}
        Export stats as CSV
        {!premium ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-accent">
            Premium
          </span>
        ) : null}
      </button>
    </Sheet>
  );
}
