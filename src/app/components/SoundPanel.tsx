"use client";

import { useEffect, useRef, useState } from "react";
import { SynthSound, type Soundscape } from "@/lib/audio";

type Track =
  | { id: string; name: string; vibe: string; icon: string; kind: "synth"; synth: Soundscape }
  | { id: string; name: string; vibe: string; icon: string; kind: "file"; src: string };

export const DEFAULT_TRACK_ID = "muse";

const TRACKS: Track[] = [
  { id: "muse", name: "Muse", vibe: "Dreamy focus", icon: "🎧", kind: "file", src: "/sounds/muse.mp3" },
  { id: "rain", name: "Rainfall", vibe: "Rainy vibe", icon: "🌧️", kind: "synth", synth: "rain" },
  { id: "ocean", name: "Ocean Waves", vibe: "Calm tide", icon: "🌊", kind: "synth", synth: "ocean" },
  { id: "brown", name: "Brown Noise", vibe: "Deep focus", icon: "🟤", kind: "synth", synth: "brown" },
  { id: "white", name: "White Noise", vibe: "Block it out", icon: "⚪", kind: "synth", synth: "white" },
  { id: "lofi", name: "Lofi Study", vibe: "Chill beats", icon: "🎵", kind: "file", src: "/sounds/lofi-study.mp3" },
  { id: "meditation", name: "Meditation", vibe: "Soft piano", icon: "🧘", kind: "file", src: "/sounds/ambient-meditation.mp3" },
  { id: "wholesome", name: "Wholesome Calm", vibe: "Warm ambient", icon: "☀️", kind: "file", src: "/sounds/ambient-wholesome.mp3" },
  { id: "reawakening", name: "Reawakening", vibe: "Gentle uplift", icon: "🌅", kind: "file", src: "/sounds/ambient-reawakening.mp3" },
  { id: "pamgaea", name: "Pamgaea", vibe: "Worldly calm", icon: "🌍", kind: "file", src: "/sounds/ambient-pamgaea.mp3" },
  { id: "springthaw", name: "Spring Thaw", vibe: "Light & airy", icon: "🌱", kind: "file", src: "/sounds/ambient-springthaw.mp3" },
  { id: "magicforest", name: "Magic Forest", vibe: "Dreamy nature", icon: "🌲", kind: "file", src: "/sounds/ambient-magicforest.mp3" },
];

export function trackMeta(id: string | null) {
  return TRACKS.find((t) => t.id === id) ?? null;
}

export interface SoundControls {
  onModeChange?: (isFocus: boolean) => void;
  toggleById?: (id: string) => void;
  playDefault?: () => void;
  cycle?: (dir: 1 | -1) => void;
}

export interface SoundState {
  activeId: string | null;
  name: string | null;
  vibe: string | null;
  icon: string | null;
}

export default function SoundPanel({
  open,
  onClose,
  volume,
  autoplayFocus,
  onAutoplayChange,
  registerControls,
  onState,
}: {
  open: boolean;
  onClose: () => void;
  volume: number;
  autoplayFocus: boolean;
  onAutoplayChange: (v: boolean) => void;
  registerControls: (c: SoundControls) => void;
  onState: (s: SoundState) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const synthRef = useRef<SynthSound | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const userPausedRef = useRef(false);

  const volumeRef = useRef(volume);
  const autoplayRef = useRef(autoplayFocus);
  const onStateRef = useRef(onState);
  useEffect(() => {
    volumeRef.current = volume;
    autoplayRef.current = autoplayFocus;
    onStateRef.current = onState;
  });

  const setActive = (id: string | null) => {
    activeIdRef.current = id;
    setActiveId(id);
  };

  const stop = () => {
    synthRef.current?.stop();
    synthRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const play = (track: Track) => {
    const v = volumeRef.current;
    stop();
    if (track.kind === "synth") {
      const s = new SynthSound();
      s.start(track.synth, v);
      synthRef.current = s;
    } else {
      const a = new Audio(track.src);
      a.loop = true;
      a.volume = v;
      a.play().catch(() => {});
      audioRef.current = a;
    }
    setActive(track.id);
  };

  const toggle = (track: Track) => {
    userPausedRef.current = false;
    if (activeIdRef.current === track.id) {
      stop();
      setActive(null);
      userPausedRef.current = true;
      return;
    }
    play(track);
  };

  useEffect(() => {
    const t = trackMeta(activeId);
    onStateRef.current({
      activeId,
      name: t?.name ?? null,
      vibe: t?.vibe ?? null,
      icon: t?.icon ?? null,
    });
  }, [activeId]);

  useEffect(() => {
    synthRef.current?.setVolume(volume);
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    registerControls({
      onModeChange: (isFocus) => {
        if (!autoplayRef.current) return;
        const id = activeIdRef.current;
        if (isFocus) {
          if (!id && !userPausedRef.current) play(trackMeta(activeId) ?? TRACKS[0]);
        } else if (id) {
          if (audioRef.current) audioRef.current.pause();
          synthRef.current?.setVolume(0);
        }
      },
      toggleById: (id) => {
        const t = trackMeta(id);
        if (t) toggle(t as Track);
      },
      playDefault: () => {
        if (activeIdRef.current || userPausedRef.current) return;
        const t = trackMeta(DEFAULT_TRACK_ID);
        if (t) play(t as Track);
      },
      cycle: (dir) => {
        const i = TRACKS.findIndex((t) => t.id === activeIdRef.current);
        const next = i < 0 ? (dir === 1 ? 0 : TRACKS.length - 1) : (i + dir + TRACKS.length) % TRACKS.length;
        userPausedRef.current = false;
        play(TRACKS[next]);
      },
    });
  });

  useEffect(() => () => stop(), []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <div className="surface relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-7 sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Focus Sounds</h2>
            <p className="text-xs text-muted">Tune out the noise, tune into focus</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="press grid h-10 w-10 place-items-center rounded-full bg-surface2 text-muted"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TRACKS.map((t) => {
            const active = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => toggle(t)}
                className={`press flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center ${
                  active ? "border-transparent text-white" : "border-border bg-surface2 text-fg"
                }`}
                style={
                  active
                    ? { background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }
                    : undefined
                }
              >
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="truncate text-sm font-semibold">{t.name}</span>
                <span className={`truncate text-xs ${active ? "text-white/80" : "text-faint"}`}>
                  {active ? "Playing" : t.vibe}
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-4 flex items-center justify-between rounded-2xl bg-surface2 p-3.5">
          <span className="text-sm font-medium">
            Auto-play during focus
            <span className="block text-xs text-faint">Pauses on breaks</span>
          </span>
          <input
            type="checkbox"
            checked={autoplayFocus}
            onChange={(e) => onAutoplayChange(e.target.checked)}
            className="h-5 w-5 accent-[var(--accent)]"
          />
        </label>
      </div>
    </div>
  );
}
