import type { FigmaVersion } from "../figma/types.ts";

// { "YYYY-MM-DD": count }, UTC dates, keys sorted.
export type DailyCounts = Record<string, number>;

// Storage format of data/contributions.json (phase-1 §31 #5, #11): daily counts per file.
// Daily totals across files are derived with sumDays, never stored.
export type FileContributions = { key: string; name: string; days: DailyCounts };
export type ContributionData = { files: FileContributions[] };

export function sumDays(files: FileContributions[]): DailyCounts {
  const total: DailyCounts = {};
  for (const file of files) {
    for (const [date, count] of Object.entries(file.days)) total[date] = (total[date] ?? 0) + count;
  }
  return Object.fromEntries(Object.entries(total).sort(([a], [b]) => a.localeCompare(b)));
}

// Each version is one activity on its UTC calendar date (phase-1 §16).
// Versions with a missing or unparseable timestamp are skipped, not guessed.
export function countByDay(versions: FigmaVersion[]): DailyCounts {
  const counts: DailyCounts = {};
  for (const v of versions) {
    const time = Date.parse(v?.created_at);
    if (Number.isNaN(time)) continue;
    const date = new Date(time).toISOString().slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}
