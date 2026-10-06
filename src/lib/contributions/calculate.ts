import type { DailyCounts } from "./normalize.ts";

export type Level = 0 | 1 | 2 | 3 | 4;

export type ContributionStats = {
  total: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveDay: { date: string; count: number } | null;
  // month is "YYYY-MM"
  mostActiveMonth: { month: string; count: number } | null;
};

const DAY_MS = 86_400_000;

// MVP thresholds (phase-1 §6). Kept in one place so they can change without re-syncing.
export function getLevel(count: number): Level {
  if (count >= 10) return 4;
  if (count >= 6) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;

// Pass a single year's counts to get that year's stats. `today` is a UTC YYYY-MM-DD date.
// Like GitHub, the current streak survives a day with no activity yet: it may end today or yesterday.
export function calculateStats(counts: DailyCounts, today = new Date().toISOString().slice(0, 10)): ContributionStats {
  const active = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  let total = 0;
  let longestStreak = 0;
  let run = 0;
  let mostActiveDay: ContributionStats["mostActiveDay"] = null;
  const byMonth = new Map<string, number>();

  active.forEach(([date, count], i) => {
    total += count;
    run = i > 0 && dayNumber(date) - dayNumber(active[i - 1][0]) === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    // Ties go to the earliest day.
    if (!mostActiveDay || count > mostActiveDay.count) mostActiveDay = { date, count };
    byMonth.set(date.slice(0, 7), (byMonth.get(date.slice(0, 7)) ?? 0) + count);
  });

  let mostActiveMonth: ContributionStats["mostActiveMonth"] = null;
  // Map keeps insertion (date) order, so ties again go to the earliest month.
  for (const [month, count] of byMonth) {
    if (!mostActiveMonth || count > mostActiveMonth.count) mostActiveMonth = { month, count };
  }

  const last = active.at(-1);
  const daysSinceLast = last ? dayNumber(today) - dayNumber(last[0]) : Infinity;
  const currentStreak = daysSinceLast === 0 || daysSinceLast === 1 ? run : 0;

  return { total, activeDays: active.length, currentStreak, longestStreak, mostActiveDay, mostActiveMonth };
}
