"use client";

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
    <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Decrease ${label}`}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg font-bold text-white/80 hover:bg-white/20"
        >
          −
        </button>
        <span className="tabular w-14 text-center text-sm font-semibold">
          {value}
          {suffix ? <span className="text-white/40"> {suffix}</span> : null}
        </span>
        <button
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Increase ${label}`}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg font-bold text-white/80 hover:bg-white/20"
        >
          +
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
    <label className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
      <span className="text-sm font-medium text-white/80">
        {label}
        {hint ? <span className="block text-xs text-white/45">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[var(--accent)]"
      />
    </label>
  );
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  if (!open) return null;
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="card-3d relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Timer (minutes)
        </p>
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
        </div>

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-white/40">
          Behaviour
        </p>
        <div className="space-y-2.5">
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
          <div className="rounded-2xl bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">Volume</span>
              <span className="tabular text-sm text-white/50">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) => set({ volume: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>

        <button
          onClick={() => onChange({ ...DEFAULT_SETTINGS })}
          className="mt-5 w-full rounded-2xl bg-white/5 py-3 text-sm font-medium text-white/60 hover:bg-white/10"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
