import { buildYearCalendar, describeDay } from "./calendar.ts";
import type { DailyCounts } from "./normalize.ts";
import type { ThemeTokens } from "../theme.ts";

export type SvgTheme = "auto" | "light" | "dark";
export type SvgOptions = {
  year: number;
  // "auto" follows the viewer's light/dark setting (CSS media query); "light"/"dark" use plain
  // hex fills, which also import cleanly into Figma and tools that ignore <style>.
  theme: SvgTheme;
  // Drop the card background and border, to sit on the host page's own background.
  transparent: boolean;
  tokens: { light: ThemeTokens; dark: ThemeTokens };
};

// Same geometry as the app: 12px cells, 4px apart (Spacing/SM).
const CELL = 12;
const PITCH = 16;
const PAD = 16;
const LABEL_W = 28;
const TITLE_H = 20;
const MONTH_H = 16;
const ROW_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const PAINTS = ["surface", "line", "foreground", "muted", "level-0", "level-1", "level-2", "level-3", "level-4"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const monthName = (m: number) => new Date(Date.UTC(2000, m, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

// A self-contained SVG of one year's heatmap: only daily counts, no file names or keys.
export function renderCalendarSvg(counts: DailyCounts, { year, theme, transparent, tokens }: SvgOptions): string {
  const { weeks, months } = buildYearCalendar(counts, year);
  const days = weeks.flat().filter((d) => d !== null);
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;

  const gridX = PAD + LABEL_W;
  const gridY = PAD + TITLE_H + MONTH_H;
  const width = gridX + weeks.length * PITCH - (PITCH - CELL) + PAD;
  const legendY = gridY + 7 * PITCH + 8;
  const height = legendY + CELL + PAD;

  // Paint: a class (auto theme, resolved by <style>) or a literal hex (fixed theme).
  const fixed = theme === "auto" ? null : tokens[theme];
  const fill = (name: string) => (fixed ? `fill="${fixed[name]}"` : `class="f-${name}"`);
  const style = fixed
    ? ""
    : `<style>${PAINTS.map((p) => `.f-${p}{fill:${tokens.light[p]}}.s-${p}{stroke:${tokens.light[p]}}`).join("")}` +
      `@media (prefers-color-scheme: dark){${PAINTS.map((p) => `.f-${p}{fill:${tokens.dark[p]}}.s-${p}{stroke:${tokens.dark[p]}}`).join("")}}</style>`;

  const id = `figma-contributions-${year}`;
  const label = `Figma contributions in ${year}`;
  const summary = `${total.toLocaleString("en-US")} version${total === 1 ? "" : "s"} on ${active} active day${active === 1 ? "" : "s"}.`;
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="${id}-title ${id}-desc" font-family="Manrope, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif">`,
    `<title id="${id}-title">${esc(label)}</title><desc id="${id}-desc">${esc(summary)}</desc>`,
    style,
  ];
  if (!transparent) {
    const stroke = fixed ? `stroke="${fixed.line}"` : `class="f-surface s-line"`;
    const bg = fixed ? `fill="${fixed.surface}" ${stroke}` : stroke;
    out.push(`<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" ${bg}/>`);
  }
  out.push(
    `<text x="${PAD}" y="${PAD + 14}" font-size="14" font-weight="600" ${fill("foreground")}>${esc(`${total.toLocaleString("en-US")} Figma version${total === 1 ? "" : "s"} in ${year}`)}</text>`,
  );

  // Month labels where a month starts, skipping one too narrow to fit (as in the app).
  months.forEach((m, i) => {
    const span = (months[i + 1]?.week ?? weeks.length) - m.week;
    if (span >= 2) out.push(`<text x="${gridX + m.week * PITCH}" y="${gridY - 5}" font-size="11" font-weight="500" ${fill("muted")}>${monthName(m.month)}</text>`);
  });
  ROW_LABELS.forEach((text, r) => {
    if (text) out.push(`<text x="${PAD}" y="${gridY + r * PITCH + 10}" font-size="11" font-weight="500" ${fill("muted")}>${text}</text>`);
  });

  weeks.forEach((week, w) =>
    week.forEach((day, r) => {
      if (!day) return;
      out.push(
        `<rect x="${gridX + w * PITCH}" y="${gridY + r * PITCH}" width="${CELL}" height="${CELL}" rx="3" ${fill(`level-${day.level}`)}><title>${esc(describeDay(day))}</title></rect>`,
      );
    }),
  );

  // Legend: Less □□□□□ More
  out.push(`<text x="${gridX}" y="${legendY + 10}" font-size="11" font-weight="500" ${fill("muted")}>Less</text>`);
  for (let level = 0; level <= 4; level++) {
    out.push(`<rect x="${gridX + 30 + level * PITCH}" y="${legendY}" width="${CELL}" height="${CELL}" rx="3" ${fill(`level-${level}`)}/>`);
  }
  out.push(`<text x="${gridX + 30 + 5 * PITCH + 2}" y="${legendY + 10}" font-size="11" font-weight="500" ${fill("muted")}>More</text>`);

  out.push("</svg>");
  return out.filter(Boolean).join("\n") + "\n";
}
