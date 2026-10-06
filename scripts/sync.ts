// Run with `npm run sync`. Node loads .env.local via --env-file-if-exists; this script
// is the only place the token is read, so it never reaches the Next.js client bundle.

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
const { fileKey } = loadConfig();
console.log(`✓ Configuration loaded (file ${fileKey})`);
