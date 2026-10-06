import { getLevel, type Level } from "./calculate.ts";
import type { DailyCounts } from "./normalize.ts";

export type ContributionDay = { date: string; count: number; level: Level };
// 7 rows, top to bottom from the week's first day. null = a slot outside the year (padding).
export type CalendarWeek = (ContributionDay | null)[];
export type YearCalendar = {
  weeks: CalendarWeek[];
  // Column where each month's 1st falls, for month labels. month is 0–11.
  months: { month: number; week: number }[];
};

const DAY_MS = 86_400_000;

// GitHub-style year grid in UTC (phase-1 §16): one column per week, every day of `year` exactly once.
// weekStart 0 = Sunday rows (GitHub), 1 = Monday. A year spans 53 columns, or 54 when a leap year
// starts on the last weekday (e.g. 2028 with Sunday start).
export function buildYearCalendar(counts: DailyCounts, year: number, weekStart: 0 | 1 = 0): YearCalendar {
  const jan1 = Date.UTC(year, 0, 1);
  const dayCount = (Date.UTC(year + 1, 0, 1) - jan1) / DAY_MS;
  const offset = (new Date(jan1).getUTCDay() - weekStart + 7) % 7;

  const weeks: CalendarWeek[] = Array.from({ length: Math.ceil((offset + dayCount) / 7) }, () => Array(7).fill(null));
  const months: YearCalendar["months"] = [];

  for (let i = 0; i < dayCount; i++) {
    const day = new Date(jan1 + i * DAY_MS);
    const date = day.toISOString().slice(0, 10);
    const count = counts[date] ?? 0;
    const pos = offset + i;
    weeks[Math.floor(pos / 7)][pos % 7] = { date, count, level: getLevel(count) };
    if (day.getUTCDate() === 1) months.push({ month: day.getUTCMonth(), week: Math.floor(pos / 7) });
  }

  return { weeks, months };
}
