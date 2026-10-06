import { card } from "@/components/ui";
import type { ContributionStats } from "@/lib/contributions/calculate";

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const formatMonth = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function StatCard({ value, label, detail }: { value: string | number; label: string; detail?: string }) {
  return (
    <div className={`${card} flex flex-col gap-0.5 px-4 py-3 transition-colors hover:border-brand/50`}>
      <dt className="order-2 text-sm text-muted">{label}</dt>
      <dd className="order-1 text-xl font-semibold tabular-nums tracking-tight [overflow-wrap:anywhere] @lg:text-2xl">{value}</dd>
      {detail && <dd className="order-3 text-xs text-muted">{detail}</dd>}
    </div>
  );
}

// Year stats, except the current streak, which is always "as of today" across all synced data.
// @container: columns follow the graph's width, not the viewport.
export function StatsGrid({ stats, currentStreak, year }: { stats: ContributionStats; currentStreak: number; year: number }) {
  const { mostActiveDay, mostActiveMonth } = stats;
  return (
    <div className="@container">
      <h2 className="sr-only">Statistics for {year}</h2>
      <dl aria-label={`Statistics for ${year}`} className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
        <StatCard value={stats.total} label="Contributions" detail={`in ${year}`} />
        <StatCard value={stats.activeDays} label="Active days" detail={`in ${year}`} />
        <StatCard value={currentStreak} label="Current streak" detail="days, as of today (UTC)" />
        <StatCard value={stats.longestStreak} label="Longest streak" detail={`days in ${year}`} />
        <StatCard
          value={mostActiveDay ? formatDate(mostActiveDay.date) : "—"}
          label="Most active day"
          detail={mostActiveDay ? plural(mostActiveDay.count, "version") : undefined}
        />
        <StatCard
          value={mostActiveMonth ? formatMonth(mostActiveMonth.month) : "—"}
          label="Most active month"
          detail={mostActiveMonth ? plural(mostActiveMonth.count, "version") : undefined}
        />
      </dl>
    </div>
  );
}
