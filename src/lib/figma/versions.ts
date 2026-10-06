import { figmaGet } from "./client.ts";
import type { FigmaVersion, FigmaVersionsResponse } from "./types.ts";

// Figma returns version history newest-first in pages; follow next_page until it runs out.
export async function fetchAllVersions(fileKey: string, token: string): Promise<FigmaVersion[]> {
  const versions: FigmaVersion[] = [];
  const visited = new Set<string>();
  let url: string | undefined = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/versions?page_size=50`;

  while (url && !visited.has(url)) {
    visited.add(url);
    const page: FigmaVersionsResponse = await figmaGet<FigmaVersionsResponse>(url, token);
    versions.push(...(page.versions ?? []));
    url = page.pagination?.next_page;
  }

  return versions;
}
