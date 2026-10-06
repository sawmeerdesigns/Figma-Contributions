export type FileEntry = { key: string; name?: string };

// FIGMA_FILE_KEYS accepts bare keys and/or pasted file URLs, separated by commas, spaces or newlines.
// A URL's slug (/design/<KEY>/<Name>) gives a fallback file name; the first entry for a key wins.
export function parseFileKeys(raw: string): FileEntry[] {
  const byKey = new Map<string, FileEntry>();
  for (const entry of raw.split(/[\s,]+/).filter(Boolean).map(parseFileKey)) {
    if (!byKey.has(entry.key)) byKey.set(entry.key, entry);
  }
  return [...byKey.values()];
}

function parseFileKey(entry: string): FileEntry {
  // Branch URLs (.../<KEY>/<name>/branch/<BRANCH_KEY>/<branch name>) must use the branch key, not the main file's.
  const url = entry.match(
    /figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]+)(?:\/([^/?#]+))?(?:\/branch\/([A-Za-z0-9]+)(?:\/([^/?#]+))?)?/,
  );
  const key = url ? (url[3] ?? url[1]) : entry;
  if (!/^[A-Za-z0-9]+$/.test(key)) {
    throw new Error(`"${entry}" doesn't look like a Figma file key or file URL.`);
  }
  const slug = url?.[3] ? url[4] : url?.[2];
  return slug ? { key, name: slugToName(slug) } : { key };
}

function slugToName(slug: string): string {
  let name = slug;
  try {
    name = decodeURIComponent(slug);
  } catch {}
  return name.replace(/-+/g, " ").trim();
}
