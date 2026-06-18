export interface Settings {
  focus: number; // minutes
  short: number;
  long: number;
  longBreakInterval: number; // long break after every N focus sessions
  autoStart: boolean;
  soundOn: boolean;
  volume: number; // 0..1
  ticking: boolean; // ticking clock during focus
  autoplayFocus: boolean; // auto-play focus sounds during focus, pause on breaks
}

export const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  short: 5,
  long: 15,
  longBreakInterval: 4,
  autoStart: false,
  soundOn: true,
  volume: 0.7,
  ticking: false,
  autoplayFocus: false,
};
