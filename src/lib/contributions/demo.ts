import type { ContributionData } from "./normalize.ts";

// Moves every date in the demo data by the same number of days so its latest day is `today`
// (UTC YYYY-MM-DD). Keeps the public demo looking current (streaks, this year) without editing demo.json.
export function shiftToToday(data: ContributionData, today: string): ContributionData {
  const latest = data.files.flatMap((f) => Object.keys(f.days)).sort().at(-1);
  if (!latest) return data;
  const offset = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${latest}T00:00:00Z`);
  const shift = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + offset).toISOString().slice(0, 10);
  return {
    files: data.files.map((f) => ({
      ...f,
      days: Object.fromEntries(Object.entries(f.days).map(([date, n]) => [shift(date), n])),
    })),
  };
}
