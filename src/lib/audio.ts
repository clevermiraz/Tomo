"use client";

/**
 * A tiny Web Audio toolkit for Tomo: one-shot alarms (focus-end / break-end),
 * a ticking clock, and breathing guidance tones. Everything shares a single,
 * lazily-created AudioContext.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

/** Browsers start the context suspended until a user gesture. */
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

function beep(
  c: AudioContext,
  freq: number,
  at: number,
  dur: number,
  vol: number,
  type: OscillatorType = "sine"
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** Distinct cues so the ear knows what just happened. */
export function playAlarm(kind: "focusEnd" | "breakEnd", volume = 1) {
  const c = getCtx();
  if (!c) return;
  resumeAudio();
  const now = c.currentTime + 0.02;
  const v = 0.32 * volume;
  // focus-end → gentle ascending "time to relax"; break-end → firmer "back to it"
  const notes =
    kind === "focusEnd"
      ? [659.25, 783.99, 1046.5]
      : [880, 659.25, 523.25];
  notes.forEach((f, i) => beep(c, f, now + i * 0.18, 0.55, v));
}

/** Short clock tick. */
export function playTick(volume = 1) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = "square";
  osc.frequency.value = 1100;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.06 * volume, 0.0002), t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  osc.start(t);
  osc.stop(t + 0.06);
}

/** A soft tone that rises on inhale and falls on exhale, to guide breathing. */
export function playBreathCue(kind: "in" | "out", durationSec: number, volume = 1) {
  const c = getCtx();
  if (!c) return;
  resumeAudio();
  const now = c.currentTime + 0.01;
  const dur = Math.max(1.2, durationSec);
  const osc = c.createOscillator();
  const gain = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  osc.connect(lp);
  lp.connect(gain);
  gain.connect(c.destination);
  osc.type = "sine";
  const f0 = kind === "in" ? 196 : 294;
  const f1 = kind === "in" ? 294 : 196;
  osc.frequency.setValueAtTime(f0, now);
  osc.frequency.linearRampToValueAtTime(f1, now + dur);
  const peak = 0.13 * volume;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

