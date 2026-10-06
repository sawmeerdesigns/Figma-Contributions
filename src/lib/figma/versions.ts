import { figmaGet } from "./client.ts";
import type { FigmaVersion, FigmaVersionsResponse } from "./types.ts";

// Figma returns version history newest-first in pages; follow next_page until it runs out,
// or until `isKnown` matches a version (incremental sync): that one and everything older are skipped.
export async function fetchAllVersions(
  fileKey: string,
  token: string,
  isKnown?: (version: FigmaVersion) => boolean,
): Promise<FigmaVersion[]> {
  const versions: FigmaVersion[] = [];
  const visited = new Set<string>();
  const seenIds = new Set<string>();
  let url: string | undefined = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/versions?page_size=50`;

  while (url && !visited.has(url)) {
    visited.add(url);
    const page: FigmaVersionsResponse = await figmaGet<FigmaVersionsResponse>(url, token);
    // Pages can overlap if new versions land mid-sync; keep each version id once.
    for (const v of page.versions ?? []) {
      if (isKnown?.(v)) return versions;
      if (seenIds.has(v.id)) continue;
      seenIds.add(v.id);
      versions.push(v);
    }
    url = page.pagination?.next_page;
  }

  return versions;
}
