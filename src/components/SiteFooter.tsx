import { InfoIcon } from "@/components/icons";

const REPO = "https://github.com/sawmeerdesigns/Figma-Contributions";
const AUTHOR = "https://github.com/sawmeerdesigns";

const link =
  "rounded-sm font-medium text-link underline underline-offset-2 transition-colors hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

// Sits at the bottom of the page (mt-auto in the flex column). `demoOnly`: a public deployment,
// where visitors need the repository rather than `npm run sync`.
export function SiteFooter({ isDemo, demoOnly }: { isDemo: boolean; demoOnly: boolean }) {
  return (
    <footer className="mt-auto flex flex-col gap-4 border-t border-line pt-6 text-body-3 text-secondary">
      {isDemo && (
        <p className="flex items-start gap-2">
          <InfoIcon className="text-info-icon" />
          <span>
            <span className="font-semibold text-foreground">Demo with made-up data.</span>{" "}
            {demoOnly ? (
              <>
                Run it locally to see your own Figma activity:{" "}
                <a href={REPO} className={link}>
                  get it on GitHub
                </a>
                .
              </>
            ) : (
              <>
                Run <code className="font-mono text-code-2">npm run sync</code> to see your own.
              </>
            )}
          </span>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          Made by{" "}
          <a href={AUTHOR} className={link}>
            sawmeerdesigns
          </a>
        </p>
        {/* Link, bold. min-h-10 keeps a 40px tap target (design.md Target sizes). */}
        <a
          href={REPO}
          className="flex min-h-10 items-center rounded-sm text-label-1 font-bold text-link underline underline-offset-2 transition-colors hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Get it now on GitHub
        </a>
      </div>
    </footer>
  );
}
