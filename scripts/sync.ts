// Run with `npm run sync` (`-- --full` to rebuild, `-- --redact` to hide file names and keys in the output). Node loads .env.local via --env-file-if-exists; this script
// is the only place the token is read, so it never reaches the Next.js client bundle.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { calculateStats } from "../src/lib/contributions/calculate.ts";
import { sumDays, type ContributionData } from "../src/lib/contributions/normalize.ts";
import { FigmaApiError, fetchCurrentUserId, requestCount } from "../src/lib/figma/client.ts";
import { parseFileKeys } from "../src/lib/figma/fileKeys.ts";
import { collectContributions } from "../src/lib/sync.ts";

// --redact: print "File #1", "File #2" instead of file names and keys, for logs others can read
// (GitHub Actions logs are public on public repositories).
const REDACT = process.argv.includes("--redact");
let knownKeys: string[] = [];
const scrub = (text: string) => (REDACT ? knownKeys.reduce((t, key, i) => t.replaceAll(key, `#${i + 1}`), text) : text);

function fail(message: string): never {
  console.error(`\n✗ ${scrub(message)}\n`);
  process.exit(1);
}

function errorMessage(error: unknown): string {
  return error instanceof FigmaApiError ? error.message : `Unexpected error: ${error}`;
}

function loadConfig() {
  const token = process.env.FIGMA_ACCESS_TOKEN?.trim();
  // FIGMA_FILE_KEY (single file) still works for older .env.local files.
  const rawFileKeys = (process.env.FIGMA_FILE_KEYS ?? process.env.FIGMA_FILE_KEY)?.trim();

  if (!token || token === "your_token_here") {
    fail("FIGMA_ACCESS_TOKEN is missing. Copy .env.example to .env.local and add your token.");
  }
  if (!rawFileKeys || rawFileKeys.includes("your_file_key_here")) {
    fail("FIGMA_FILE_KEYS is missing. Copy .env.example to .env.local and add your file keys or URLs.");
  }

  try {
    return { token, fileKeys: parseFileKeys(rawFileKeys) };
  } catch (error) {
    fail(REDACT ? "FIGMA_FILE_KEYS has an entry that isn't a Figma file key or file URL." : `FIGMA_FILE_KEYS: ${(error as Error).message}`);
  }
}

const outFile = fileURLToPath(new URL("../data/contributions.json", import.meta.url));

// The last sync's data, so only newer versions are fetched. `npm run sync -- --full` ignores it.
async function loadPrevious(): Promise<ContributionData | undefined> {
  if (process.argv.includes("--full")) return undefined;
  try {
    const data = JSON.parse(await readFile(outFile, "utf8"));
    return Array.isArray(data.files) ? data : undefined;
  } catch {
    return undefined; // missing or unreadable: do a full sync
  }
}

console.log("Figma Contributions Sync\n");
const { token, fileKeys } = loadConfig();
knownKeys = fileKeys.map((f) => f.key);
console.log(`✓ Configuration loaded (${fileKeys.length} file${fileKeys.length === 1 ? "" : "s"})`);

let userId: string;
try {
  userId = await fetchCurrentUserId(token);
} catch (error) {
  fail(errorMessage(error));
}
console.log("✓ Authentication successful");

console.log("\nFetching version history (your versions / all versions)...");
let newOwn = 0;
let skipped = 0;
let exactNames = 0;
let data: ContributionData;
const previous = await loadPrevious();
try {
  data = await collectContributions(fileKeys, userId, token, previous, ({ key, name, mode, own, skipped: bad, fetched, exactName }) => {
    newOwn += own;
    skipped += bad;
    if (exactName) exactNames++;
    const what = mode === "full" ? `${own} / ${fetched} (full history)` : `+${own} / ${fetched} new`;
    console.log(`✓ ${REDACT ? `File #${knownKeys.indexOf(key) + 1}` : `${name} (${key})`}: ${what}`);
  });
} catch (error) {
  fail(errorMessage(error));
}
if (exactNames < fileKeys.length) {
  console.log("  Names come from your file URLs. Add the file_metadata:read scope to your token for Figma's current names.");
}

const counts = sumDays(data.files);
const days = Object.keys(counts);
const stats = calculateStats(counts);
const counted = stats.total;
console.log("✓ Activity processed");

try {
  await mkdir(fileURLToPath(new URL("../data/", import.meta.url)), { recursive: true });
  // Write then rename, so an interrupted sync never leaves a half-written file for the app to read.
  await writeFile(`${outFile}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
  await rename(`${outFile}.tmp`, outFile);
} catch (error) {
  fail(`Could not write ${outFile}: ${(error as Error).message}`);
}
console.log("✓ Contributions generated");

console.log(`\nTotal versions by you: ${counted}${previous ? ` (${newOwn} new this sync)` : ""}`);
if (skipped > 0) console.log(`Skipped (bad timestamp): ${skipped}`);
console.log(`Figma API requests: ${requestCount}`);
console.log(`Active days: ${stats.activeDays}`);
console.log(`Current streak: ${stats.currentStreak} · Longest streak: ${stats.longestStreak}`);
if (stats.mostActiveDay) console.log(`Most active day: ${stats.mostActiveDay.date} (${stats.mostActiveDay.count})`);
if (days.length > 0) {
  console.log(`First active day: ${days[0]}`);
  console.log(`Last active day: ${days.at(-1)}`);
} else {
  // Still written (with empty days), so an old file from a previous sync doesn't linger.
  console.log("No Figma activity by you found in these files.");
}
console.log("\nData written to:\ndata/contributions.json");
