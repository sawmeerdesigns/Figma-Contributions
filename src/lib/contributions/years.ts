import type { DailyCounts } from "./normalize.ts";

// Figma launched in 2016; nothing can be older.
const FIRST_YEAR = 2016;

// Picks the year to show and the years to offer. Offered years run without gaps from the earliest
// year with data (or the selected year) up to the current year, so empty years can be opened too.
// Defaults to the latest year with data, else the current year. Invalid or future years fall back to the default.
export function resolveYear(counts: DailyCounts, requested: string | string[] | undefined, currentYear: number) {
  const dataYears = Object.keys(counts).map((date) => Number(date.slice(0, 4)));
  const latest = dataYears.length > 0 ? Math.max(...dataYears) : currentYear;
  const asked = Number(requested);
  const year = Number.isInteger(asked) && asked >= FIRST_YEAR && asked <= currentYear ? asked : Math.min(latest, currentYear);

  const from = Math.min(year, ...dataYears.filter((y) => y >= FIRST_YEAR));
  const years = Array.from({ length: currentYear - from + 1 }, (_, i) => currentYear - i);
  return { year, years };
}
