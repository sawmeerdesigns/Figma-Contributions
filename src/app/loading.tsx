import { SiteHeader } from "@/components/SiteHeader";
import { card, page } from "@/components/ui";

// Shown while the page reads data/contributions.json (e.g. switching years).
export default function Loading() {
  return (
    <main className={page}>
      <SiteHeader />
      <div role="status" className="flex w-[928px] max-w-full flex-col gap-4">
        <span className="sr-only">Loading contributions…</span>
        <div className={`${card} h-60 motion-safe:animate-pulse`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${card} h-24 motion-safe:animate-pulse`} />
          ))}
        </div>
      </div>
    </main>
  );
}
