"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { card } from "@/components/ui";

// Next 16 error boundary: `retry` re-fetches and re-renders the page.
// Usually a broken or outdated data/contributions.json; in production builds the message is hidden, so the hint is generic.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-12 sm:py-16">
      <SiteHeader />
      <div role="alert" className={`${card} flex max-w-xl flex-col gap-3 p-5`}>
        <h2 className="font-medium">Couldn’t load your contributions</h2>
        <p className="text-sm text-muted">
          The data file couldn’t be read. Run <code className="font-mono text-foreground">npm run sync</code> to regenerate{" "}
          <code className="font-mono text-foreground">data/contributions.json</code>, then try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="rounded-md bg-background px-3 py-2 font-mono text-xs text-muted">{error.message}</p>
        )}
        <button
          type="button"
          onClick={() => retry()}
          className="w-fit rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
