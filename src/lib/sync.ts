import { countByDay, sumDays, type ContributionData } from "./contributions/normalize.ts";
import { FigmaApiError, fetchFileName } from "./figma/client.ts";
import type { FileEntry } from "./figma/fileKeys.ts";
import { fetchAllVersions } from "./figma/versions.ts";

export type FileSummary = {
  key: string;
  name: string;
  // "full": whole history fetched; "incremental": only versions newer than the last sync
  mode: "full" | "incremental";
  own: number;
  // own versions not counted because their timestamp was missing or impossible
  skipped: number;
  fetched: number;
  exactName: boolean;
};

// The sync pipeline minus config and output: fetch each file's history, keep only `userId`'s
// versions (versions with no user are dropped), and count them per UTC day. Any file failing
// fails the whole sync, so a partial result never overwrites good data.
//
// With `previous` data from the same user, a file that has a syncedThrough bookmark is synced
// incrementally: pages are read newest-first until a version at or before the bookmark, and the
// new counts are added to the stored ones. This also keeps days Figma no longer returns (e.g.
// history limits). Files not in `files` are dropped; new files get a full fetch.
export async function collectContributions(
  files: FileEntry[],
  userId: string,
  token: string,
  previous?: ContributionData,
  onFile?: (summary: FileSummary) => void,
): Promise<ContributionData> {
  const data: ContributionData = { userId, files: [] };
  const reusable = previous?.userId === userId ? previous.files : [];
  // Stop asking for names once Figma refuses (token without file_metadata:read): saves a request per file.
  let namesReadable = true;
  // ponytail: sequential to stay under Figma's rate limits; parallelize with a small pool if many files make sync slow.
  for (const { key, name: urlName } of files) {
    const prev = reusable.find((f) => f.key === key && f.syncedThrough);
    // ponytail: a version in the same second as the bookmark is treated as already counted; track ids if that ever matters.
    const since = prev ? Date.parse(prev.syncedThrough!) : NaN;
    const isKnown = Number.isNaN(since) ? undefined : (v: { created_at: string }) => Date.parse(v.created_at) <= since;

    let versions;
    try {
      versions = await fetchAllVersions(key, token, isKnown);
    } catch (error) {
      if (error instanceof FigmaApiError) throw new FigmaApiError(error.status, `File ${key}: ${error.message}`);
      throw error;
    }
    // Name: Figma's current name (needs file_metadata:read), else the pasted URL's slug, else the key.
    const figmaName = namesReadable ? await fetchFileName(key, token) : null;
    if (figmaName === null) namesReadable = false;
    const name = figmaName ?? urlName ?? key;
    const own = versions.filter((v) => v.user?.id === userId);
    const newDays = countByDay(own);
    const newest = versions.map((v) => v.created_at).filter((t) => !Number.isNaN(Date.parse(t)));
    newest.sort((a, b) => Date.parse(b) - Date.parse(a));
    data.files.push({
      key,
      name,
      days: isKnown && prev ? sumDays([prev, { days: newDays }]) : newDays,
      syncedThrough: newest[0] ?? prev?.syncedThrough,
    });
    const counted = Object.values(newDays).reduce((sum, n) => sum + n, 0);
    onFile?.({
      key,
      name,
      mode: isKnown ? "incremental" : "full",
      own: own.length,
      skipped: own.length - counted,
      fetched: versions.length,
      exactName: figmaName !== null,
    });
  }
  return data;
}
