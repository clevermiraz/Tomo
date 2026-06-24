"use client";

import { Minus, Plus, Lock } from "lucide-react";
import Sheet from "./Sheet";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";

function Stepper({
  label,
  suffix,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface2 p-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Decrease ${label}`}
          className="press grid h-8 w-8 place-items-center rounded-full border border-border bg-surface"
        >
          <Minus size={15} />
        </button>
        <span className="tabular w-14 text-center text-sm font-semibold">
          {value}
          {suffix ? <span className="text-faint"> {suffix}</span> : null}
        </span>
        <button
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Increase ${label}`}
          className="press grid h-8 w-8 place-items-center rounded-full border border-border bg-surface"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-surface2 p-3">
      <span className="text-sm font-medium">
        {label}
        {hint ? <span className="block text-xs text-faint">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-accent"
      />
    </label>
  );
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
  premium = false,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
  premium?: boolean;
  onUpgrade?: () => void;
}) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Timer (minutes)</p>
      <div className="space-y-2.5">
        <Stepper label="Focus" value={settings.focus} min={1} max={90} onChange={(v) => set({ focus: v })} />
        <Stepper label="Short break" value={settings.short} min={1} max={60} onChange={(v) => set({ short: v })} />
        <Stepper label="Long break" value={settings.long} min={1} max={60} onChange={(v) => set({ long: v })} />
        <Stepper
          label="Long break after"
          suffix="sessions"
          value={settings.longBreakInterval}
          min={2}
          max={8}
          onChange={(v) => set({ longBreakInterval: v })}
        />
        <Stepper
          label="Daily goal"
          suffix="sessions"
          value={settings.dailyGoal}
          min={1}
          max={16}
          onChange={(v) => set({ dailyGoal: v })}
        />
      </div>

      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-faint">Behaviour</p>
      <div className="space-y-2.5">
        <Toggle
          label="Start music with timer"
          hint="Play the default focus music on Start"
          checked={settings.defaultMusic}
          onChange={(v) => set({ defaultMusic: v })}
        />
        <Toggle
          label="Auto-start next timer"
          hint="Roll straight into the next session"
          checked={settings.autoStart}
          onChange={(v) => set({ autoStart: v })}
        />
        <Toggle
          label="Sound alerts"
          hint="Chime when a session ends"
          checked={settings.soundOn}
          onChange={(v) => set({ soundOn: v })}
        />
        <Toggle
          label="Ticking clock"
          hint="Soft tick every second while focusing"
          checked={settings.ticking}
          onChange={(v) => set({ ticking: v })}
        />
        <div className="rounded-2xl bg-surface2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Volume</span>
            <span className="tabular text-sm text-muted">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => set({ volume: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>
      </div>

      <button
        onClick={() => onChange({ ...DEFAULT_SETTINGS })}
        className="press mt-5 w-full rounded-2xl bg-surface2 py-3 text-sm font-medium text-muted"
      >
        Reset to defaults
      </button>

      {/* Focus Discipline — premium gated */}
      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-faint">Focus Discipline</p>
      {premium ? (
        <div className="space-y-2.5">
          <Toggle
            label="Strict Mode"
            hint="Hold to extend, repeating alerts, momentum rewards"
            checked={settings.strictMode}
            onChange={(v) => set({ strictMode: v })}
          />
        </div>
      ) : (
        <button
          onClick={onUpgrade}
          className="press flex w-full items-center gap-3 rounded-2xl bg-surface2 p-3 text-left"
        >
          <Lock size={16} className="shrink-0 text-faint" />
          <span className="text-sm">
            <span className="font-semibold">Strict Mode</span>
            <span className="block text-xs text-faint">Upgrade to Premium to unlock</span>
          </span>
        </button>
      )}
    </Sheet>
  );
}
