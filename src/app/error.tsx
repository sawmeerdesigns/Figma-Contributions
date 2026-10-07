"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { ErrorIcon } from "@/components/icons";
import { page } from "@/components/ui";

// Next 16 error boundary: `retry` re-fetches and re-renders the page.
// Usually a broken or outdated data/contributions.json; in production builds the message is hidden, so the hint is generic.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className={page}>
      <SiteHeader />
      {/* Alert · Card, Error tone: surface, border, icon and title from Status/Error */}
      <div role="alert" className="flex max-w-xl gap-3 rounded-xl border border-error-border bg-error-surface p-4 sm:p-6">
        <ErrorIcon className="mt-0.5 text-error-icon" />
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-heading-4 text-error-text">Couldn’t load your contributions</h2>
          <p className="text-body-2 text-secondary">
            The data file couldn’t be read. Run <code className="font-mono text-code-2 text-foreground">npm run sync</code> to
            regenerate <code className="font-mono text-code-2 text-foreground">data/contributions.json</code>, then try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="rounded-lg bg-surface-sunken px-3 py-2 font-mono text-code-2 text-secondary [overflow-wrap:anywhere]">{error.message}</p>
          )}
          {/* Button: Brand, Filled, Medium */}
          <button
            type="button"
            onClick={() => retry()}
            className="h-10 w-fit rounded-lg bg-brand px-4 text-label-1 text-on-brand transition-colors hover:bg-brand-hover active:bg-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
