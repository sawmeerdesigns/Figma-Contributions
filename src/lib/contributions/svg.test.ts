import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readThemeTokens } from "../theme.ts";
import { renderCalendarSvg } from "./svg.ts";

const tokens = readThemeTokens(readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8"));
const counts = { "2024-02-29": 12, "2024-03-01": 1, "2023-12-31": 5 };
const cells = (svg: string) => (svg.match(/<rect [^>]*><title>/g) ?? []).length;

test("one cell per day of the year, with tooltips, title and summary; other years ignored", () => {
  const svg = renderCalendarSvg(counts, { year: 2024, theme: "auto", transparent: false, tokens });
  assert.equal(cells(svg), 366);
  assert.match(svg, /<title>12 versions on Thursday, February 29, 2024<\/title>/);
  assert.match(svg, /<desc id="figma-contributions-2024-desc">13 versions on 2 active days\.<\/desc>/);
  assert.match(svg, /13 Figma versions in 2024/);
  assert.equal(cells(renderCalendarSvg(counts, { year: 2023, theme: "auto", transparent: false, tokens })), 365);
});

test("auto theme follows prefers-color-scheme; fixed themes use plain hex fills and no <style>", () => {
  const auto = renderCalendarSvg(counts, { year: 2024, theme: "auto", transparent: false, tokens });
  assert.match(auto, /@media \(prefers-color-scheme: dark\)/);
  assert.match(auto, new RegExp(`\\.f-level-4\\{fill:${tokens.light["level-4"]}\\}`));
  for (const theme of ["light", "dark"] as const) {
    const svg = renderCalendarSvg(counts, { year: 2024, theme, transparent: false, tokens });
    assert.doesNotMatch(svg, /<style>|class=/);
    assert.ok(svg.includes(`fill="${tokens[theme]["level-4"]}"`), `${theme}: level-4 colour`);
    assert.ok(svg.includes(`fill="${tokens[theme].surface}" stroke="${tokens[theme].line}"`), `${theme}: card`);
  }
});

test("transparent drops the card", () => {
  const card = renderCalendarSvg(counts, { year: 2024, theme: "light", transparent: false, tokens });
  const bare = renderCalendarSvg(counts, { year: 2024, theme: "light", transparent: true, tokens });
  assert.match(card, /<rect x="0.5" y="0.5"/);
  assert.doesNotMatch(bare, /<rect x="0.5" y="0.5"/);
});
