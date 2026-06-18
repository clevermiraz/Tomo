"use client";

/**
 * A tiny Web Audio toolkit for Tomo:
 *  - one-shot alarms (focus-end / break-end) and a ticking sound
 *  - looping synthesized soundscapes (rain, ocean, brown/white noise)
 * Everything shares a single, lazily-created AudioContext so it works
 * offline with zero audio files.
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

function noiseBuffer(c: AudioContext, brown: boolean): AudioBuffer {
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buf;
}

export type Soundscape = "rain" | "ocean" | "brown" | "white";

/** A single looping ambient sound, with a smooth fade in/out. */
export class SynthSound {
  private c: AudioContext;
  private master: GainNode;
  private parts: AudioScheduledSourceNode[] = [];
  private lfo: OscillatorNode | null = null;

  constructor() {
    const c = getCtx();
    if (!c) throw new Error("No AudioContext");
    this.c = c;
    this.master = c.createGain();
    this.master.gain.value = 0;
    this.master.connect(c.destination);
  }

  start(type: Soundscape, volume: number) {
    resumeAudio();
    const c = this.c;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, type !== "white");
    src.loop = true;

    let node: AudioNode = src;

    if (type === "rain") {
      const hp = c.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 800;
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1400;
      bp.Q.value = 0.4;
      src.connect(hp);
      hp.connect(bp);
      node = bp;
    } else if (type === "ocean") {
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 600;
      src.connect(lp);
      // slow swell to mimic waves
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 0.12;
      lfoGain.gain.value = 0.5;
      const swell = c.createGain();
      swell.gain.value = 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(swell.gain);
      lp.connect(swell);
      lfo.start();
      this.lfo = lfo;
      node = swell;
    }

    node.connect(this.master);
    src.start();
    this.parts.push(src);
    // fade in
    const now = c.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(volume, now + 0.4);
  }

  setVolume(v: number) {
    const now = this.c.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(v, now + 0.1);
  }

  stop() {
    const now = this.c.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.3);
    const parts = this.parts;
    const lfo = this.lfo;
    setTimeout(() => {
      parts.forEach((p) => {
        try {
          p.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        lfo?.stop();
      } catch {
        /* already stopped */
      }
    }, 350);
    this.parts = [];
    this.lfo = null;
  }
}
