// Focus Garden — local, offline streak & progress tracking.
// Every completed focus session "ripens a tomato"; consistency builds streaks.

export interface DayStat {
  sessions: number;
  minutes: number;
}

export interface GardenData {
  days: Record<string, DayStat>; // keyed by YYYY-MM-DD
  bestStreak: number;
}

export const DEFAULT_GARDEN: GardenData = { days: {}, bestStreak: 0 };

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function prevKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function todaySessions(data: GardenData, today: string): number {
  return data.days[today]?.sessions ?? 0;
}

export function computeStreak(days: Record<string, DayStat>, today: string): number {
  let d = today;
  // Grace: if today isn't done yet, the streak still counts up to yesterday.
  if (!(days[d]?.sessions > 0)) d = prevKey(d);
  let count = 0;
  while (days[d]?.sessions > 0) {
    count++;
    d = prevKey(d);
  }
  return count;
}

export function addSession(data: GardenData, minutes: number, today: string): GardenData {
  const day = data.days[today] ?? { sessions: 0, minutes: 0 };
  const days = {
    ...data.days,
    [today]: { sessions: day.sessions + 1, minutes: day.minutes + minutes },
  };
  const streak = computeStreak(days, today);
  return { days, bestStreak: Math.max(data.bestStreak, streak) };
}

export function totals(days: Record<string, DayStat>) {
  return Object.values(days).reduce(
    (acc, d) => ({ sessions: acc.sessions + d.sessions, minutes: acc.minutes + d.minutes }),
    { sessions: 0, minutes: 0 }
  );
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function lastNDays(
  days: Record<string, DayStat>,
  n: number,
  today: string
): { key: string; label: string; sessions: number }[] {
  const out: { key: string; label: string; sessions: number }[] = [];
  let k = today;
  for (let i = 0; i < n; i++) {
    const wd = new Date(`${k}T00:00:00Z`).getUTCDay();
    out.unshift({ key: k, label: WEEKDAYS[wd], sessions: days[k]?.sessions ?? 0 });
    k = prevKey(k);
  }
  return out;
}
