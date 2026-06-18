"use client";

import { useEffect, useRef, useState } from "react";
import { SynthSound, type Soundscape } from "@/lib/audio";

type Track =
  | { id: string; name: string; vibe: string; icon: string; kind: "synth"; synth: Soundscape }
  | { id: string; name: string; vibe: string; icon: string; kind: "file"; src: string }
  | { id: string; name: string; vibe: string; icon: string; kind: "soundcloud" };

export const DEFAULT_TRACK_ID = "soundcloud";

const TRACKS: Track[] = [
  { id: "soundcloud", name: "Muse — Tide", vibe: "by Meet Malde · online", icon: "🎧", kind: "soundcloud" },
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

const SC_SRC =
  "https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F521646333&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false";

interface SCWidget {
  play(): void;
  pause(): void;
  setVolume(v: number): void;
  bind(event: string, cb: () => void): void;
}
interface SCApi {
  Widget: ((el: HTMLIFrameElement) => SCWidget) & {
    Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string };
  };
}
declare global {
  interface Window {
    SC?: SCApi;
  }
}

function loadSCApi(): Promise<SCApi | null> {
  return new Promise((resolve) => {
    if (window.SC) return resolve(window.SC);
    const existing = document.getElementById("sc-widget-api");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.SC ?? null));
      return;
    }
    const s = document.createElement("script");
    s.id = "sc-widget-api";
    s.src = "https://w.soundcloud.com/player/api.js";
    s.onload = () => resolve(window.SC ?? null);
    s.onerror = () => resolve(null);
    document.body.appendChild(s);
  });
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
  const [scMounted, setScMounted] = useState(false);
  const synthRef = useRef<SynthSound | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const pendingScPlay = useRef(false);
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

  const stopLocal = () => {
    synthRef.current?.stop();
    synthRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const scPlay = () => {
    stopLocal();
    if (!widgetRef.current) {
      // Lazy-mount the SoundCloud player on first use, then play once ready.
      pendingScPlay.current = true;
      setScMounted(true);
      return;
    }
    widgetRef.current.play();
  };
  const scPause = () => widgetRef.current?.pause();

  const play = (track: Track) => {
    const v = volumeRef.current;
    if (track.kind === "soundcloud") {
      scPlay();
      setActive("soundcloud");
      return;
    }
    scPause();
    stopLocal();
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
      if (track.kind === "soundcloud") scPause();
      else stopLocal();
      setActive(null);
      userPausedRef.current = true;
      return;
    }
    play(track);
  };

  useEffect(() => {
    if (!scMounted) return;
    let cancelled = false;
    loadSCApi().then((SC) => {
      if (cancelled || !SC || !iframeRef.current) return;
      const widget = SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      widget.bind(SC.Widget.Events.READY, () => {
        widget.setVolume(volumeRef.current * 100);
        if (pendingScPlay.current) {
          pendingScPlay.current = false;
          widget.play();
        }
      });
      widget.bind(SC.Widget.Events.PLAY, () => {
        stopLocal();
        setActive("soundcloud");
      });
      widget.bind(SC.Widget.Events.PAUSE, () => {
        if (activeIdRef.current === "soundcloud") setActive(null);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [scMounted]);

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
    widgetRef.current?.setVolume(volume * 100);
  }, [volume]);

  useEffect(() => {
    registerControls({
      onModeChange: (isFocus) => {
        if (!autoplayRef.current) return;
        const id = activeIdRef.current;
        if (isFocus) {
          if (!id && !userPausedRef.current) play(trackMeta(activeId) ?? TRACKS[0]);
        } else if (id) {
          if (id === "soundcloud") scPause();
          else if (audioRef.current) audioRef.current.pause();
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

  useEffect(() => () => stopLocal(), []);

  return (
    <>
      {scMounted && (
        <iframe
          ref={iframeRef}
          title="SoundCloud player"
          src={SC_SRC}
          allow="autoplay"
          className="pointer-events-none fixed -left-[9999px] h-px w-px opacity-0"
        />
      )}

      {open && (
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
                      active
                        ? "border-transparent text-white"
                        : "border-border bg-surface2 text-fg"
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
      )}
    </>
  );
}
