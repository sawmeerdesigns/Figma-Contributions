import type { FigmaVersion } from "../figma/types.ts";

// Storage format (phase-1 §31 #5): { "YYYY-MM-DD": count }, UTC dates, keys sorted.
export type DailyCounts = Record<string, number>;

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
