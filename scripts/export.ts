// Run with `npm run export`. Writes the contribution calendar as one SVG image, for a portfolio,
// README or anywhere an image goes. Reads data/contributions.json (from `npm run sync`); needs no token.
// Options: --year 2026  --theme auto|light|dark  --transparent  --out path.svg  --demo

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { shiftToToday } from "../src/lib/contributions/demo.ts";
import { sumDays, type ContributionData } from "../src/lib/contributions/normalize.ts";
import { renderCalendarSvg, type SvgTheme } from "../src/lib/contributions/svg.ts";
import { resolveYear } from "../src/lib/contributions/years.ts";
import { readThemeTokens } from "../src/lib/theme.ts";

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

let args;
try {
  args = parseArgs({
    options: {
      year: { type: "string" },
      theme: { type: "string", default: "auto" },
      transparent: { type: "boolean", default: false },
      out: { type: "string", default: "data/contributions.svg" },
      demo: { type: "boolean", default: false },
    },
  }).values;
} catch (error) {
  fail(`${(error as Error).message}. Options: --year 2026 --theme auto|light|dark --transparent --out file.svg --demo`);
}

const theme = args.theme as SvgTheme;
if (!["auto", "light", "dark"].includes(theme)) fail(`--theme must be auto, light or dark (got "${args.theme}").`);

let data: ContributionData;
if (args.demo) {
  data = shiftToToday(JSON.parse(await readFile(root("data/demo.json"), "utf8")), new Date().toISOString().slice(0, 10));
} else {
  try {
    data = JSON.parse(await readFile(root("data/contributions.json"), "utf8"));
  } catch {
    fail("No data/contributions.json yet. Run `npm run sync` first, or add --demo to export the demo data.");
  }
  if (!Array.isArray(data.files)) fail("data/contributions.json is in an old format. Run `npm run sync -- --full`.");
}

const counts = sumDays(data.files);
const { year } = resolveYear(counts, args.year, new Date().getUTCFullYear());
if (args.year && String(year) !== args.year) fail(`--year ${args.year} isn't available. Use a year from 2016 up to this year.`);

const tokens = readThemeTokens(await readFile(root("src/app/globals.css"), "utf8"));
const svg = renderCalendarSvg(counts, { year, theme, transparent: args.transparent, tokens });
await writeFile(args.out, svg);

const total = Object.entries(counts).reduce((sum, [d, n]) => (d.startsWith(`${year}-`) ? sum + n : sum), 0);
console.log(`✓ ${args.out}: ${year}, ${total.toLocaleString("en-US")} versions, ${theme} theme${args.transparent ? ", transparent" : ""}${args.demo ? " (demo data)" : ""}`);
