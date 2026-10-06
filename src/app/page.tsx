import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ContributionGraph, ContributionLegend } from "@/components/contribution/ContributionGraph";
import { buildYearCalendar } from "@/lib/contributions/calendar";
import type { DailyCounts } from "@/lib/contributions/normalize";
import demo from "../../data/demo.json";

// Real data from `npm run sync` (gitignored). Without it, show committed demo data (phase-1 §31 #6).
async function loadCounts(): Promise<{ counts: DailyCounts; isDemo: boolean }> {
  try {
    const file = await readFile(path.join(process.cwd(), "data", "contributions.json"), "utf8");
    return { counts: JSON.parse(file), isDemo: false };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { counts: demo, isDemo: true };
  }
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const { counts, isDemo } = await loadCounts();
  const years = [...new Set(Object.keys(counts).map((date) => Number(date.slice(0, 4))))].sort((a, b) => b - a);
  const requested = Number((await searchParams).year);
  const year = years.includes(requested) ? requested : (years[0] ?? new Date().getUTCFullYear());

  const calendar = buildYearCalendar(counts, year);
  const total = calendar.weeks.flat().reduce((sum, day) => sum + (day?.count ?? 0), 0);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Figma Contributions</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Figma activity, not productivity. Each saved version counts once.</p>
      </header>

      {isDemo && (
        <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Showing demo data. Run <code className="font-mono">npm run sync</code> to see your own.
        </p>
      )}

      <section aria-labelledby="graph-title" className="flex w-fit max-w-full flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="graph-title" className="text-base font-medium">
            {total} version{total === 1 ? "" : "s"} in {year}
          </h2>
          {years.length > 1 && (
            <nav aria-label="Year" className="flex gap-1 text-sm">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/?year=${y}`}
                  aria-current={y === year ? "page" : undefined}
                  className="rounded-md px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 aria-[current=page]:bg-zinc-900 aria-[current=page]:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:aria-[current=page]:bg-zinc-100 dark:aria-[current=page]:text-zinc-900"
                >
                  {y}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <ContributionGraph {...calendar} year={year} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          {total === 0 ? (
            <p className="text-sm text-zinc-500">
              No Figma activity in {year}. Add files to <code className="font-mono">FIGMA_FILE_KEYS</code> and run{" "}
              <code className="font-mono">npm run sync</code>.
            </p>
          ) : (
            <span />
          )}
          <ContributionLegend />
        </div>
      </section>
    </main>
  );
}
