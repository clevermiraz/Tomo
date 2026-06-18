"use client";

import { useEffect, useRef, useState } from "react";
import { SynthSound, type Soundscape } from "@/lib/audio";

type Track =
  | { id: string; name: string; vibe: string; kind: "synth"; synth: Soundscape }
  | { id: string; name: string; vibe: string; kind: "file"; src: string }
  | { id: string; name: string; vibe: string; kind: "soundcloud" };

const TRACKS: Track[] = [
  { id: "rain", name: "Rainfall", vibe: "Rainy vibe", kind: "synth", synth: "rain" },
  { id: "ocean", name: "Ocean Waves", vibe: "Calm tide", kind: "synth", synth: "ocean" },
  { id: "brown", name: "Brown Noise", vibe: "Deep focus", kind: "synth", synth: "brown" },
  { id: "white", name: "White Noise", vibe: "Block it out", kind: "synth", synth: "white" },
  { id: "lofi", name: "Lofi Study", vibe: "Chill beats", kind: "file", src: "/sounds/lofi-study.mp3" },
  { id: "meditation", name: "Meditation", vibe: "Soft piano", kind: "file", src: "/sounds/ambient-meditation.mp3" },
  { id: "wholesome", name: "Wholesome Calm", vibe: "Warm ambient", kind: "file", src: "/sounds/ambient-wholesome.mp3" },
  { id: "soundcloud", name: "Muse — Tide", vibe: "by Meet Malde · streams online", kind: "soundcloud" },
];

// SoundCloud track "Focus Music - Muse from Tide app" (official embed).
const SC_SRC =
  "https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F521646333&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false";

// Minimal typings for the SoundCloud Widget API.
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
}

export default function SoundPanel({
  open,
  onClose,
  volume,
  autoplayFocus,
  onAutoplayChange,
  registerControls,
}: {
  open: boolean;
  onClose: () => void;
  volume: number;
  autoplayFocus: boolean;
  onAutoplayChange: (v: boolean) => void;
  registerControls: (c: SoundControls) => void;
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
    if (!scMounted) {
      pendingScPlay.current = true;
      setScMounted(true);
      return;
    }
    widgetRef.current?.play();
  };
  const scPause = () => widgetRef.current?.pause();

  const play = (track: Track) => {
    if (track.kind === "soundcloud") {
      scPlay();
      setActiveId("soundcloud");
      activeIdRef.current = "soundcloud";
      return;
    }
    scPause();
    stopLocal();
    if (track.kind === "synth") {
      const s = new SynthSound();
      s.start(track.synth, volume);
      synthRef.current = s;
    } else {
      const a = new Audio(track.src);
      a.loop = true;
      a.volume = volume;
      a.play().catch(() => {
        /* autoplay blocked until a gesture */
      });
      audioRef.current = a;
    }
    setActiveId(track.id);
    activeIdRef.current = track.id;
  };

  const toggle = (track: Track) => {
    userPausedRef.current = false;
    if (activeIdRef.current === track.id) {
      if (track.kind === "soundcloud") scPause();
      else stopLocal();
      setActiveId(null);
      activeIdRef.current = null;
      userPausedRef.current = true;
      return;
    }
    play(track);
  };

  // Initialise the SoundCloud widget once its iframe is mounted.
  useEffect(() => {
    if (!scMounted || !iframeRef.current) return;
    let cancelled = false;
    loadSCApi().then((SC) => {
      if (cancelled || !SC || !iframeRef.current) return;
      const widget = SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      widget.bind(SC.Widget.Events.READY, () => {
        widget.setVolume(volume * 100);
        if (pendingScPlay.current) {
          pendingScPlay.current = false;
          widget.play();
        }
      });
      // Keep the UI in sync if the user uses SoundCloud's own controls.
      widget.bind(SC.Widget.Events.PLAY, () => {
        stopLocal();
        setActiveId("soundcloud");
        activeIdRef.current = "soundcloud";
      });
      widget.bind(SC.Widget.Events.PAUSE, () => {
        if (activeIdRef.current === "soundcloud") {
          setActiveId(null);
          activeIdRef.current = null;
        }
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scMounted]);

  // Keep live volume in sync across all players.
  useEffect(() => {
    synthRef.current?.setVolume(volume);
    if (audioRef.current) audioRef.current.volume = volume;
    widgetRef.current?.setVolume(volume * 100);
  }, [volume]);

  // Let the timer pause music on breaks / resume on focus.
  useEffect(() => {
    registerControls({
      onModeChange: (isFocus) => {
        if (!autoplayFocus) return;
        const id = activeIdRef.current;
        if (isFocus) {
          if (!id && !userPausedRef.current) {
            const last = TRACKS.find((t) => t.id === activeId) ?? TRACKS[0];
            play(last);
          }
        } else if (id) {
          if (id === "soundcloud") scPause();
          else if (audioRef.current) audioRef.current.pause();
          synthRef.current?.setVolume(0);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayFocus, activeId]);

  useEffect(() => () => stopLocal(), []);

  return (
    <>
      {/* Hidden, always-mounted SoundCloud player so audio survives panel close. */}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="card-3d relative z-10 w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Focus Sounds</h2>
                <p className="text-xs text-white/50">Tune out the noise, tune into focus</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {TRACKS.map((t) => {
                const active = activeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t)}
                    className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                      active
                        ? "border-transparent text-white"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                    style={
                      active
                        ? { background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }
                        : undefined
                    }
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">{t.name}</span>
                      <span className="text-base">{active ? "❚❚" : "▶"}</span>
                    </span>
                    <span className={`text-xs ${active ? "text-white/80" : "text-white/45"}`}>
                      {t.vibe}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="mt-5 flex items-center justify-between rounded-2xl bg-white/5 p-3.5">
              <span className="text-sm font-medium text-white/80">
                Auto-play during focus
                <span className="block text-xs text-white/45">Pauses on breaks</span>
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
