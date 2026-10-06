import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { FigmaApiError } from "./figma/client.ts";
import { stubFetch } from "./figma/stubFetch.ts";
import { collectContributions, type FileSummary } from "./sync.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const versions = (key: string) => `https://api.figma.com/v1/files/${key}/versions?page_size=50`;
const meta = (key: string) => `https://api.figma.com/v1/files/${key}/meta`;
const noScope = { status: 403, body: { status: 403, err: "Invalid scope" } };
const v = (id: string, created_at: string, userId?: string) => ({ id, created_at, user: userId ? { id: userId, handle: userId } : undefined });

test("keeps only the user's versions per file, per UTC day, with names", async () => {
  stubFetch({
    [versions("A")]: {
      body: {
        versions: [
          v("1", "2026-10-06T09:00:00Z", "me"),
          v("2", "2026-10-06T23:59:59Z", "me"),
          v("3", "2026-10-06T10:00:00Z", "teammate"),
          v("4", "2026-10-05T10:00:00Z"), // no user: dropped
          v("5", "2025-12-31T23:59:59Z", "me"), // year boundary
          v("6", "2026-01-01T00:00:00Z", "me"),
        ],
      },
    },
    [meta("A")]: { body: { file: { name: "Figma Name" } } },
    [versions("B")]: { body: { versions: [] } }, // empty history
    [meta("B")]: noScope,
    [versions("C")]: { body: { versions: [v("7", "2026-02-29T12:00:00Z", "me")] } }, // invalid date: skipped
    [meta("C")]: noScope,
  });

  const summaries: FileSummary[] = [];
  const data = await collectContributions([{ key: "A", name: "Url Name" }, { key: "B", name: "Empty" }, { key: "C" }], "me", "tok", (s) =>
    summaries.push(s),
  );

  assert.deepEqual(data, {
    files: [
      { key: "A", name: "Figma Name", days: { "2025-12-31": 1, "2026-01-01": 1, "2026-10-06": 2 } },
      { key: "B", name: "Empty", days: {} },
      { key: "C", name: "C", days: {} },
    ],
  });
  assert.deepEqual(
    summaries.map(({ name, own, all, exactName }) => [name, own, all, exactName]),
    [["Figma Name", 4, 6, true], ["Empty", 0, 0, false], ["C", 1, 1, false]],
  );
});

test("a failing file fails the whole sync and names the file", async () => {
  stubFetch({
    [versions("A")]: { body: { versions: [] } },
    [meta("A")]: noScope,
    [versions("B")]: { status: 404, body: { status: 404, err: "Not found" } },
  });
  await assert.rejects(
    collectContributions([{ key: "A" }, { key: "B" }], "me", "tok"),
    (e: unknown) => e instanceof FigmaApiError && e.status === 404 && /^File B: Figma file not found/.test(e.message),
  );
});
