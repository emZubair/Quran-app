import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Local calendar date as YYYY-MM-DD. Streaks are a local-day concept. */
export function isoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

/** The seven ISO dates of the current week, Monday first — the Home bar row. */
export function currentWeekDates(today: Date = new Date()): string[] {
  const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
  const monday = addDays(today, -dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => isoDate(addDays(monday, i)));
}

interface StreakState {
  /** ISO date -> seconds read that day */
  days: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  /** Adds reading time to today and recomputes streaks. */
  recordReading: (seconds: number, goalMinutes: number) => void;
  recomputeStreaks: (goalMinutes: number) => void;
  loadStreaks: () => Promise<void>;
}

const STREAK_KEY = "quran_streaks";

function metGoal(seconds: number | undefined, goalMinutes: number): boolean {
  return (seconds ?? 0) >= goalMinutes * 60;
}

/**
 * The streak runs back from today, or from yesterday if today's goal is not
 * met yet — an unfinished today must not read as a broken streak.
 */
function computeCurrentStreak(
  days: Record<string, number>,
  goalMinutes: number,
): number {
  const today = new Date();
  let cursor = metGoal(days[isoDate(today)], goalMinutes)
    ? today
    : addDays(today, -1);
  let streak = 0;
  while (metGoal(days[isoDate(cursor)], goalMinutes)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function computeLongestStreak(
  days: Record<string, number>,
  goalMinutes: number,
  previousLongest: number,
): number {
  const met = Object.keys(days)
    .filter((d) => metGoal(days[d], goalMinutes))
    .sort();
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of met) {
    run =
      previous && isoDate(addDays(new Date(previous), 1)) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }
  return Math.max(longest, previousLongest);
}

export const useStreakStore = create<StreakState>((set, get) => ({
  days: {},
  currentStreak: 0,
  longestStreak: 0,

  recordReading: (seconds, goalMinutes) => {
    if (seconds <= 0) return;
    const today = isoDate();
    const days = { ...get().days, [today]: (get().days[today] ?? 0) + seconds };
    set({ days });
    get().recomputeStreaks(goalMinutes);
    persistStreaks(get());
  },

  recomputeStreaks: (goalMinutes) => {
    const { days, longestStreak } = get();
    const currentStreak = computeCurrentStreak(days, goalMinutes);
    set({
      currentStreak,
      longestStreak: Math.max(
        computeLongestStreak(days, goalMinutes, longestStreak),
        currentStreak,
      ),
    });
  },

  loadStreaks: async () => {
    const json = await AsyncStorage.getItem(STREAK_KEY);
    if (!json) return;
    const saved = JSON.parse(json);
    set({
      days: saved.days ?? {},
      currentStreak: saved.currentStreak ?? 0,
      longestStreak: saved.longestStreak ?? 0,
    });
  },
}));

function persistStreaks(state: StreakState) {
  AsyncStorage.setItem(
    STREAK_KEY,
    JSON.stringify({
      days: state.days,
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
    }),
  );
}
