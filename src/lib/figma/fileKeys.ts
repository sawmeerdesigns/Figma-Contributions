// FIGMA_FILE_KEYS accepts bare keys and/or pasted file URLs, separated by commas, spaces or newlines.
export function parseFileKeys(raw: string): string[] {
  return [...new Set(raw.split(/[\s,]+/).filter(Boolean).map(parseFileKey))];
}

function parseFileKey(entry: string): string {
  // Branch URLs (.../<KEY>/<name>/branch/<BRANCH_KEY>/...) must use the branch key, not the main file's.
  const url = entry.match(/figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]+)(?:\/[^/?#]+\/branch\/([A-Za-z0-9]+))?/);
  const key = url ? (url[2] ?? url[1]) : entry;
  if (!/^[A-Za-z0-9]+$/.test(key)) {
    throw new Error(`"${entry}" doesn't look like a Figma file key or file URL.`);
  }
  return key;
}
