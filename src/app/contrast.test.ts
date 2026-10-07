import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readThemeTokens } from "../lib/theme.ts";

// WCAG 2.2 AA contrast for the theme tokens in globals.css, both themes.
// Heatmap cells are not checked against 3:1: every cell's count is also given as text
// (accessible name, tooltip, stats), so colour is not the only way to read it (roadmap Phase 14).
// The "#ffffff on brand" pair is gone on purpose: labels on gold use on-brand (Text/Button/Primary).
const { light, dark } = readThemeTokens(readFileSync(new URL("./globals.css", import.meta.url), "utf8"));

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const TEXT = 4.5;
const UI = 3;
// [foreground, background, minimum]. Pairs the UI actually uses (Sameer's Design System tokens).
const PAIRS: [string, string, number][] = [
  ["foreground", "surface", TEXT],
  ["foreground", "background", TEXT],
  ["secondary", "surface", TEXT],
  ["muted", "surface", TEXT],
  ["muted", "background", TEXT],
  ["brand-text", "surface", TEXT],
  ["on-brand", "brand", TEXT], // selected year, Try again
  ["on-brand", "brand-hover", TEXT],
  ["on-brand", "brand-pressed", TEXT],
  ["on-inverse", "inverse", TEXT], // tooltip
  ["foreground", "info-surface", TEXT], // demo banner
  ["info-text", "info-surface", TEXT],
  ["link", "info-surface", TEXT],
  ["info-icon", "info-surface", UI],
  ["error-text", "error-surface", TEXT], // error alert
  ["secondary", "error-surface", TEXT],
  ["error-icon", "error-surface", UI],
  ["focus", "surface", UI], // focus ring
  ["focus", "background", UI],
];

for (const [name, theme] of [["light", light], ["dark", dark]] as const) {
  test(`${name} theme meets WCAG AA contrast`, () => {
    for (const [fg, bg, min] of PAIRS) {
      const r = ratio(theme[fg] ?? fg, theme[bg] ?? bg);
      assert.ok(r >= min, `${fg} on ${bg}: ${r.toFixed(2)} < ${min}`);
    }
  });
}
