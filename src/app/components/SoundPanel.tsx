"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Sheet from "./Sheet";

type Track = { id: string; name: string; vibe: string; icon: string; src: string };

export const DEFAULT_TRACK_ID = "muse";

const TRACKS: Track[] = [
  { id: "muse", name: "Muse", vibe: "Dreamy focus", icon: "🎧", src: "/sounds/muse.mp3" },
  { id: "rain", name: "Rain on Roof", vibe: "Rainy vibe", icon: "🌧️", src: "/sounds/rain-on-roof.mp3" },
  { id: "lofi", name: "Lofi Study", vibe: "Chill beats", icon: "🎵", src: "/sounds/lofi-study.mp3" },
  { id: "meditation", name: "Meditation", vibe: "Soft piano", icon: "🧘", src: "/sounds/ambient-meditation.mp3" },
  { id: "wholesome", name: "Wholesome Calm", vibe: "Warm ambient", icon: "☀️", src: "/sounds/ambient-wholesome.mp3" },
  { id: "reawakening", name: "Reawakening", vibe: "Gentle uplift", icon: "🌅", src: "/sounds/ambient-reawakening.mp3" },
  { id: "pamgaea", name: "Pamgaea", vibe: "Worldly calm", icon: "🌍", src: "/sounds/ambient-pamgaea.mp3" },
  { id: "springthaw", name: "Spring Thaw", vibe: "Light & airy", icon: "🌱", src: "/sounds/ambient-springthaw.mp3" },
  { id: "magicforest", name: "Magic Forest", vibe: "Dreamy nature", icon: "🌲", src: "/sounds/ambient-magicforest.mp3" },
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const play = (track: Track) => {
    stop();
    const a = new Audio(track.src);
    a.loop = true;
    a.volume = volumeRef.current;
    a.play().catch(() => {});
    audioRef.current = a;
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
        }
      },
      toggleById: (id) => {
        const t = trackMeta(id);
        if (t) toggle(t);
      },
      playDefault: () => {
        if (activeIdRef.current || userPausedRef.current) return;
        const t = trackMeta(DEFAULT_TRACK_ID);
        if (t) play(t);
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

  return (
    <Sheet open={open} onClose={onClose} title="Focus Sounds" subtitle="Tune out the noise, tune into focus">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {TRACKS.map((t, i) => {
          const active = activeId === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => toggle(t)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.18 }}
              whileTap={{ scale: 0.96 }}
              className={`flex min-h-23 flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center ${
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
            </motion.button>
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
          className="h-5 w-5 accent-accent"
        />
      </label>
    </Sheet>
  );
}
