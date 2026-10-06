import type { FigmaVersion } from "../figma/types.ts";

// { "YYYY-MM-DD": count }, UTC dates, keys sorted.
export type DailyCounts = Record<string, number>;

// Storage format of data/contributions.json (phase-1 §31 #5, #11, #12): daily counts per file.
// Daily totals across files are derived with sumDays, never stored.
// syncedThrough (newest version timestamp seen) and userId let the next sync fetch only newer versions.
export type FileContributions = { key: string; name: string; days: DailyCounts; syncedThrough?: string };
export type ContributionData = { userId?: string; files: FileContributions[] };

export function sumDays(files: { days: DailyCounts }[]): DailyCounts {
  const total: DailyCounts = {};
  for (const file of files) {
    for (const [date, count] of Object.entries(file.days)) total[date] = (total[date] ?? 0) + count;
  }
  return Object.fromEntries(Object.entries(total).sort(([a], [b]) => a.localeCompare(b)));
}

// Date.parse rolls impossible dates over (2026-02-29 becomes March 1), so check the written date is real first.
function isRealDate(timestamp: unknown): timestamp is string {
  const m = typeof timestamp === "string" && timestamp.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

// Each version is one activity on its UTC calendar date (phase-1 §16).
// Versions with a missing, unparseable or impossible timestamp are skipped, not guessed.
export function countByDay(versions: FigmaVersion[]): DailyCounts {
  const counts: DailyCounts = {};
  for (const v of versions) {
    if (!isRealDate(v?.created_at)) continue;
    const time = Date.parse(v.created_at);
    if (Number.isNaN(time)) continue;
    const date = new Date(time).toISOString().slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}
