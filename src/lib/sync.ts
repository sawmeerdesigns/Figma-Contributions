import { countByDay, type ContributionData } from "./contributions/normalize.ts";
import { FigmaApiError, fetchFileName } from "./figma/client.ts";
import type { FileEntry } from "./figma/fileKeys.ts";
import { fetchAllVersions } from "./figma/versions.ts";

export type FileSummary = { key: string; name: string; own: number; all: number; exactName: boolean };

// The sync pipeline minus config and output: fetch each file's history, keep only `userId`'s
// versions (versions with no user are dropped), and count them per UTC day. Any file failing
// fails the whole sync, so a partial result never overwrites good data.
export async function collectContributions(
  files: FileEntry[],
  userId: string,
  token: string,
  onFile?: (summary: FileSummary) => void,
): Promise<ContributionData> {
  const data: ContributionData = { files: [] };
  // ponytail: sequential to stay under Figma's rate limits; parallelize with a small pool if many files make sync slow.
  for (const { key, name: urlName } of files) {
    let versions;
    try {
      versions = await fetchAllVersions(key, token);
    } catch (error) {
      if (error instanceof FigmaApiError) throw new FigmaApiError(error.status, `File ${key}: ${error.message}`);
      throw error;
    }
    // Name: Figma's current name (needs file_metadata:read), else the pasted URL's slug, else the key.
    const figmaName = await fetchFileName(key, token);
    const name = figmaName ?? urlName ?? key;
    const own = versions.filter((v) => v.user?.id === userId);
    data.files.push({ key, name, days: countByDay(own) });
    onFile?.({ key, name, own: own.length, all: versions.length, exactName: figmaName !== null });
  }
  return data;
}
