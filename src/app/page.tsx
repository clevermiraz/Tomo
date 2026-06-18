"use client";

import { useRef, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import SettingsModal from "./components/SettingsModal";
import SoundPanel, {
  DEFAULT_TRACK_ID,
  type SoundControls,
  type SoundState,
} from "./components/SoundPanel";
import InstallPrompt from "./components/InstallPrompt";
import FocusTimer from "./components/FocusTimer";
import QuickNap from "./components/QuickNap";
import Breathwork from "./components/Breathwork";
import Segmented from "./components/Segmented";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";
import { resumeAudio } from "@/lib/audio";
import type { Tool, ToolProps } from "@/lib/tools";

const TOOLS: { key: Tool; label: string }[] = [
  { key: "focus", label: "Focus Timer" },
  { key: "nap", label: "Quick Nap" },
  { key: "breathe", label: "Breathwork" },
];

export default function Home() {
  const [settings, setSettings] = useLocalStorage<Settings>("tomo-settings", DEFAULT_SETTINGS);
  const [tool, setTool] = useState<Tool>("focus");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [sound, setSound] = useState<SoundState>({ activeId: null, name: null, vibe: null, icon: null });

  const soundControls = useRef<SoundControls>({});

  const onStart = () => {
    resumeAudio();
    if (settings.defaultMusic) soundControls.current.playDefault?.();
  };

  const toggleMusic = () => {
    resumeAudio();
    soundControls.current.toggleById?.(sound.activeId ?? DEFAULT_TRACK_ID);
  };
  const cycle = (dir: 1 | -1) => {
    resumeAudio();
    soundControls.current.cycle?.(dir);
  };

  const playing = sound.activeId != null;

  // Shared now-playing selector — a sleek horizontal music control.
  const miniPlayer = (
    <div className="mt-6 flex items-center gap-2 rounded-2xl bg-surface2 p-2">
      <button
        onClick={() => cycle(-1)}
        aria-label="Previous sound"
        className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted hover:text-fg"
      >
        ‹
      </button>

      <button
        onClick={() => setSoundOpen(true)}
        className="flex min-w-0 flex-1 items-center gap-2.5"
        aria-label="Browse focus sounds"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-lg">
          {sound.icon ?? "🎵"}
        </span>
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-semibold">{sound.name ?? "Focus music"}</span>
          <span className="block truncate text-xs text-faint">
            {playing ? "Now playing" : "Tap to choose"}
          </span>
        </span>
      </button>

      <button
        onClick={() => cycle(1)}
        aria-label="Next sound"
        className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted hover:text-fg"
      >
        ›
      </button>

      <button
        onClick={toggleMusic}
        aria-label={playing ? "Pause music" : "Play music"}
        className="press grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }}
      >
        {playing ? (
          <span className="flex items-end gap-[3px]" aria-hidden>
            <span className="eq-bar h-4 w-[3px] rounded-full bg-white" />
            <span className="eq-bar eq-bar-2 h-4 w-[3px] rounded-full bg-white" />
            <span className="eq-bar eq-bar-3 h-4 w-[3px] rounded-full bg-white" />
          </span>
        ) : (
          <span className="text-lg leading-none">▶</span>
        )}
      </button>
    </div>
  );

  const toolProps: ToolProps = {
    settings,
    onOpenSettings: () => setSettingsOpen(true),
    soundControls,
    miniPlayer,
    onStart,
  };

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-dvh flex-col">
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-24">
          <header className="z-10 mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Tomo</h1>
          <p className="mt-1.5 text-sm text-muted">Your focus friend</p>
        </header>

          {/* Tool switcher */}
          <div className="z-10 mb-7 w-full max-w-md">
            <Segmented
              items={TOOLS.map((t) => ({ key: t.key, label: t.label }))}
              value={tool}
              onChange={(k) => setTool(k as Tool)}
              containerClassName="surface"
            />
          </div>

          {tool === "focus" && <FocusTimer {...toolProps} />}
          {tool === "nap" && <QuickNap {...toolProps} />}
          {tool === "breathe" && <Breathwork {...toolProps} />}
        </main>
        <SiteFooter />
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
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
      <InstallPrompt />
    </>
  );
}
