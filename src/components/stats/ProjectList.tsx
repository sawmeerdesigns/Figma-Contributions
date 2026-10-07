import { card, formatCount } from "@/components/ui";
import type { ProjectTotal } from "@/lib/contributions/calculate";

export function ProjectList({ projects, year }: { projects: ProjectTotal[]; year: number }) {
  if (projects.length === 0) return null;
  const max = projects[0].count;
  return (
    <section aria-labelledby="projects-title" className={`${card} flex flex-col gap-4 p-4 sm:p-6`}>
      <h2 id="projects-title" className="text-heading-4">
        Most active projects in {year}
      </h2>
      <ol className="flex flex-col gap-3">
        {projects.map((p) => (
          <li key={p.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3 text-label-1">
              <span className="min-w-0 truncate" title={p.name}>
                {p.name}
              </span>
              <span className="tabular-nums text-secondary">
                {formatCount(p.count)} <span className="sr-only">versions</span>
              </span>
            </div>
            {/* Progress: Radius/Full, Surface/Tertiary track, Action/Primary fill */}
            <div aria-hidden className="h-1.5 rounded-full bg-(--level-0)">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(p.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
