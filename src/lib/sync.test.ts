import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { ContributionData } from "./contributions/normalize.ts";
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
  const entries = [{ key: "A", name: "Url Name" }, { key: "B", name: "Empty" }, { key: "C" }];
  const data = await collectContributions(entries, "me", "tok", undefined, (s) => summaries.push(s));

  assert.deepEqual(data, {
    userId: "me",
    files: [
      { key: "A", name: "Figma Name", days: { "2025-12-31": 1, "2026-01-01": 1, "2026-10-06": 2 }, syncedThrough: "2026-10-06T23:59:59Z" },
      { key: "B", name: "Empty", days: {}, syncedThrough: undefined },
      { key: "C", name: "C", days: {}, syncedThrough: "2026-02-29T12:00:00Z" },
    ],
  });
  assert.deepEqual(
    summaries.map(({ name, mode, own, skipped, fetched, exactName }) => [name, mode, own, skipped, fetched, exactName]),
    [
      ["Figma Name", "full", 4, 0, 6, true],
      ["Empty", "full", 0, 0, 0, false],
      ["C", "full", 1, 1, 1, false],
    ],
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

test("incremental: fetches only newer versions, stops paging early, adds to stored days", async () => {
  const page2 = `${versions("A")}&before=10`;
  const calls = stubFetch({
    [versions("A")]: {
      body: {
        versions: [v("12", "2026-10-07T08:00:00Z", "me"), v("11", "2026-10-06T20:00:00Z", "me"), v("10", "2026-10-06T09:00:00Z", "me")],
        pagination: { next_page: page2 },
      },
    },
    [page2]: { body: { versions: [v("9", "2026-10-01T09:00:00Z", "me")] } }, // must not be requested
    [meta("A")]: noScope,
  });
  const previous: ContributionData = {
    userId: "me",
    files: [
      { key: "A", name: "A", days: { "2026-10-01": 5, "2026-10-06": 1 }, syncedThrough: "2026-10-06T09:00:00Z" },
      { key: "GONE", name: "Removed from config", days: { "2026-01-01": 9 }, syncedThrough: "2026-01-01T00:00:00Z" },
    ],
  };
  const summaries: FileSummary[] = [];
  const data = await collectContributions([{ key: "A" }], "me", "tok", previous, (s) => summaries.push(s));

  assert.deepEqual(data, {
    userId: "me",
    files: [{ key: "A", name: "A", days: { "2026-10-01": 5, "2026-10-06": 2, "2026-10-07": 1 }, syncedThrough: "2026-10-07T08:00:00Z" }],
  });
  assert.equal(calls.filter((c) => c.url.includes("/versions")).length, 1, "stopped at the bookmark, no second page");
  assert.deepEqual([summaries[0].mode, summaries[0].own, summaries[0].fetched], ["incremental", 2, 2]);
});

test("incremental with nothing new keeps the stored data", async () => {
  stubFetch({
    [versions("A")]: { body: { versions: [v("10", "2026-10-06T09:00:00Z", "me")] } },
    [meta("A")]: noScope,
  });
  const stored = { key: "A", name: "A", days: { "2026-10-06": 1 }, syncedThrough: "2026-10-06T09:00:00Z" };
  const data = await collectContributions([{ key: "A" }], "me", "tok", { userId: "me", files: [stored] });
  assert.deepEqual(data.files, [stored]);
});

test("full fetch when the token owner changed or the file has no bookmark", async () => {
  stubFetch({
    [versions("A")]: { body: { versions: [v("1", "2026-10-06T09:00:00Z", "me")] } },
    [meta("A")]: noScope,
  });
  const stale = { key: "A", name: "A", days: { "2020-01-01": 99 }, syncedThrough: "2026-10-06T09:00:00Z" };
  for (const previous of [
    { userId: "someone-else", files: [stale] },
    { files: [{ key: "A", name: "A", days: { "2020-01-01": 99 } }] }, // pre-Phase-16 data
  ]) {
    const summaries: FileSummary[] = [];
    const data = await collectContributions([{ key: "A" }], "me", "tok", previous, (s) => summaries.push(s));
    assert.deepEqual(data.files[0].days, { "2026-10-06": 1 });
    assert.equal(summaries[0].mode, "full");
  }
});
