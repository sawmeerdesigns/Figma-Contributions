// Run with `npm run sync`. Node loads .env.local via --env-file-if-exists; this script
// is the only place the token is read, so it never reaches the Next.js client bundle.

import { FigmaApiError } from "../src/lib/figma/client.ts";
import { fetchAllVersions } from "../src/lib/figma/versions.ts";

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function loadConfig() {
  const token = process.env.FIGMA_ACCESS_TOKEN?.trim();
  const rawFileKey = process.env.FIGMA_FILE_KEY?.trim();

  if (!token || token === "your_token_here") {
    fail("FIGMA_ACCESS_TOKEN is missing. Copy .env.example to .env.local and add your token.");
  }
  if (!rawFileKey || rawFileKey === "your_file_key_here") {
    fail("FIGMA_FILE_KEY is missing. Copy .env.example to .env.local and add your file key.");
  }

  // Accept a pasted file URL as well as a bare key.
  const fileKey = rawFileKey.match(/figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]+)/)?.[1] ?? rawFileKey;
  if (!/^[A-Za-z0-9]+$/.test(fileKey)) {
    fail(`FIGMA_FILE_KEY "${rawFileKey}" doesn't look like a Figma file key or file URL.`);
  }

  return { token, fileKey };
}

console.log("Figma Contributions Sync\n");
const { token, fileKey } = loadConfig();
console.log(`✓ Configuration loaded (file ${fileKey})`);

console.log("\nConnecting to Figma and fetching version history...");
let versions;
try {
  versions = await fetchAllVersions(fileKey, token);
} catch (error) {
  fail(error instanceof FigmaApiError ? error.message : `Unexpected error: ${error}`);
}
console.log("✓ Authentication successful");
console.log("✓ File found");
console.log("✓ Version history fetched");

if (versions.length === 0) {
  console.log("\nNo Figma activity found.");
  process.exit(0);
}

const dates = versions.map((v) => v.created_at).sort();
console.log(`\nTotal versions: ${versions.length}`);
console.log(`Oldest: ${dates[0]}`);
console.log(`Newest: ${dates.at(-1)}`);
