import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ContributionGraph, ContributionLegend } from "@/components/contribution/ContributionGraph";
import { SiteHeader } from "@/components/SiteHeader";
import { ProjectList } from "@/components/stats/ProjectList";
import { StatsGrid } from "@/components/stats/StatsGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { card, formatCount, page } from "@/components/ui";
import { calculateStats, rankProjects } from "@/lib/contributions/calculate";
import { shiftToToday } from "@/lib/contributions/demo";
import { buildYearCalendar } from "@/lib/contributions/calendar";
import { sumDays, type ContributionData } from "@/lib/contributions/normalize";
import { resolveYear } from "@/lib/contributions/years";
import demo from "../../data/demo.json";

// Public deployments only ever show demo data (roadmap Phase 19), even if a real data file was uploaded.
const DEMO_ONLY = process.env.VERCEL === "1" || process.env.DEMO_MODE === "1";

// Demo dates are shifted so the latest day is today: the demo never looks abandoned.
// JSON imports get a literal type per file (optional `undefined` dates), so go through unknown.
const demoData = () => ({ data: shiftToToday(demo as unknown as ContributionData, new Date().toISOString().slice(0, 10)), isDemo: true });

// Real data from `npm run sync` (gitignored). Without it, show committed demo data (phase-1 §31 #6).
async function loadData(): Promise<{ data: ContributionData; isDemo: boolean }> {
  if (DEMO_ONLY) return demoData();
  let file;
  try {
    file = await readFile(path.join(process.cwd(), "data", "contributions.json"), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return demoData();
  }
  const data = JSON.parse(file);
  // Files written before Phase 12 were a bare { date: count } map.
  if (!Array.isArray(data.files)) throw new Error("data/contributions.json is in the pre-Phase-12 format (no per-file data).");
  return { data, isDemo: false };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const { data, isDemo } = await loadData();
  const counts = sumDays(data.files);
  const { year, years } = resolveYear(counts, (await searchParams).year, new Date().getUTCFullYear());

  const calendar = buildYearCalendar(counts, year);
  const stats = calculateStats(Object.fromEntries(Object.entries(counts).filter(([date]) => date.startsWith(`${year}-`))));
  const { currentStreak } = calculateStats(counts);
  const total = stats.total;
  const projects = rankProjects(data.files, year);

  return (
    <main className={page}>
      <SiteHeader />

      <section aria-labelledby="graph-title" className="flex w-fit max-w-full flex-col gap-4">
        <div className={`${card} flex flex-col gap-4 p-4 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="graph-title" className="text-heading-4">
                <span className="tabular-nums">{formatCount(total)}</span> version{total === 1 ? "" : "s"} in {year}
              </h2>
              {/* Tag, Info tone: keeps "made up" visible up top; the full note is in the footer. */}
              {isDemo && (
                <span className="rounded-full border border-info-border bg-info-surface px-2 py-0.5 text-label-3 text-info-text">
                  Demo data
                </span>
              )}
            </div>
            {years.length > 1 && (
              <nav aria-label="Year" className="flex gap-1">
                {years.map((y) => (
                  <Link
                    key={y}
                    href={`/?year=${y}`}
                    aria-current={y === year ? "page" : undefined}
                    className="flex min-h-10 items-center rounded-lg px-3 text-label-1 tabular-nums text-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-h-8 aria-[current=page]:bg-brand aria-[current=page]:text-on-brand aria-[current=page]:hover:bg-brand-hover"
                  >
                    {y}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* key: reset keyboard focus when the year changes */}
          <ContributionGraph key={year} {...calendar} year={year} />

          <div className="flex flex-wrap items-center justify-between gap-2">
            {total === 0 ? (
              <p className="text-body-3 text-secondary">
                No Figma activity in {year}. Add files to <code className="font-mono text-code-2">FIGMA_FILE_KEYS</code> and run{" "}
                <code className="font-mono text-code-2">npm run sync</code>.
              </p>
            ) : (
              <span />
            )}
            <ContributionLegend />
          </div>
        </div>

        <StatsGrid stats={stats} currentStreak={currentStreak} year={year} />

        <ProjectList projects={projects} year={year} />
      </section>

      <SiteFooter isDemo={isDemo} demoOnly={DEMO_ONLY} />
    </main>
  );
}
