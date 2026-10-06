// Run with `npm run sync`. Node loads .env.local via --env-file-if-exists; this script
// is the only place the token is read, so it never reaches the Next.js client bundle.

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { calculateStats } from "../src/lib/contributions/calculate.ts";
import { countByDay } from "../src/lib/contributions/normalize.ts";
import { FigmaApiError, fetchCurrentUserId } from "../src/lib/figma/client.ts";
import { parseFileKeys } from "../src/lib/figma/fileKeys.ts";
import type { FigmaVersion } from "../src/lib/figma/types.ts";
import { fetchAllVersions } from "../src/lib/figma/versions.ts";

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
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
    fail(`FIGMA_FILE_KEYS: ${(error as Error).message}`);
  }
}

console.log("Figma Contributions Sync\n");
const { token, fileKeys } = loadConfig();
console.log(`✓ Configuration loaded (${fileKeys.length} file${fileKeys.length === 1 ? "" : "s"})`);

let userId: string;
try {
  userId = await fetchCurrentUserId(token);
} catch (error) {
  fail(errorMessage(error));
}
console.log("✓ Authentication successful");

console.log("\nFetching version history (your versions / all versions)...");
const mine: FigmaVersion[] = [];
// ponytail: sequential to stay under Figma's rate limits; parallelize with a small pool if many files make sync slow.
for (const fileKey of fileKeys) {
  let versions: FigmaVersion[];
  try {
    versions = await fetchAllVersions(fileKey, token);
  } catch (error) {
    fail(`File ${fileKey}: ${errorMessage(error)}`);
  }
  const own = versions.filter((v) => v.user?.id === userId);
  mine.push(...own);
  console.log(`✓ ${fileKey}: ${own.length} / ${versions.length}`);
}

const counts = countByDay(mine);
const days = Object.keys(counts);
const stats = calculateStats(counts);
const counted = stats.total;
console.log("✓ Activity processed");

const outFile = fileURLToPath(new URL("../data/contributions.json", import.meta.url));
try {
  await mkdir(fileURLToPath(new URL("../data/", import.meta.url)), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(counts, null, 2)}\n`);
} catch (error) {
  fail(`Could not write ${outFile}: ${(error as Error).message}`);
}
console.log("✓ Contributions generated");

console.log(`\nTotal versions by you: ${counted}`);
if (counted < mine.length) console.log(`Skipped (bad timestamp): ${mine.length - counted}`);
console.log(`Active days: ${stats.activeDays}`);
console.log(`Current streak: ${stats.currentStreak} · Longest streak: ${stats.longestStreak}`);
if (stats.mostActiveDay) console.log(`Most active day: ${stats.mostActiveDay.date} (${stats.mostActiveDay.count})`);
if (days.length > 0) {
  console.log(`First active day: ${days[0]}`);
  console.log(`Last active day: ${days.at(-1)}`);
} else {
  // Still written (as {}), so an old file from a previous sync doesn't linger.
  console.log("No Figma activity by you found in these files.");
}
console.log("\nData written to:\ndata/contributions.json");
