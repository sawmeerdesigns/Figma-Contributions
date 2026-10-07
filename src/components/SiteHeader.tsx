// A 3×3 mini heatmap as the mark; the same shape is the favicon (app/icon.svg).
const MARK = [1, 3, 2, 4, 2, 0, 2, 4, 3];

export function SiteHeader() {
  return (
    <header className="flex items-center gap-3">
      <svg viewBox="0 0 34 34" className="size-9 shrink-0" aria-hidden>
        {MARK.map((level, i) => (
          <rect key={i} x={(i % 3) * 12} y={Math.floor(i / 3) * 12} width="10" height="10" rx="2.5" fill={`var(--level-${level})`} />
        ))}
      </svg>
      <div className="flex flex-col">
        <h1 className="text-heading-1">Figma Contributions</h1>
        <p className="text-body-2 text-secondary">Figma activity, not productivity. Each saved version counts once.</p>
      </div>
    </header>
  );
}
