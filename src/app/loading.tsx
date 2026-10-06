import { SiteHeader } from "@/components/SiteHeader";
import { card } from "@/components/ui";

// Shown while the page reads data/contributions.json (e.g. switching years).
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-12 sm:py-16">
      <SiteHeader />
      <div role="status" className="flex w-full max-w-[52rem] flex-col gap-4">
        <span className="sr-only">Loading contributions…</span>
        <div className={`${card} h-48 motion-safe:animate-pulse`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${card} h-[84px] motion-safe:animate-pulse`} />
          ))}
        </div>
      </div>
    </main>
  );
}
