import type { ProjectTotal } from "@/lib/contributions/calculate";

export function ProjectList({ projects, year }: { projects: ProjectTotal[]; year: number }) {
  if (projects.length === 0) return null;
  const max = projects[0].count;
  return (
    <section aria-labelledby="projects-title" className="flex flex-col gap-2">
      <h2 id="projects-title" className="text-base font-medium">
        Most active projects in {year}
      </h2>
      <ol className="flex flex-col gap-2">
        {projects.map((p) => (
          <li key={p.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate" title={p.name}>
                {p.name}
              </span>
              <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                {p.count} <span className="sr-only">versions</span>
              </span>
            </div>
            <div aria-hidden className="h-1.5 rounded-full bg-(--level-0)">
              <div className="h-full rounded-full bg-(--level-3)" style={{ width: `${(p.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
