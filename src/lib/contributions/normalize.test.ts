import assert from "node:assert/strict";
import { test } from "node:test";
import type { FigmaVersion } from "../figma/types.ts";
import { countByDay, sumDays } from "./normalize.ts";

const v = (id: string, created_at: string) => ({ id, created_at }) as FigmaVersion;

test("year boundary: the last second of Dec 31 and the first of Jan 1 are different years", () => {
  assert.deepEqual(countByDay([v("1", "2025-12-31T23:59:59Z"), v("2", "2026-01-01T00:00:00Z"), v("3", "2026-01-01T00:30:00+01:00")]), {
    "2025-12-31": 2,
    "2026-01-01": 1,
  });
});

test("counts versions per UTC day, sorted by date", () => {
  const counts = countByDay([
    v("1", "2026-10-06T12:48:33Z"),
    v("2", "2026-10-05T23:59:59Z"),
    v("3", "2026-10-06T00:00:00Z"),
    // 01:30 at +02:00 is still the previous day in UTC.
    v("4", "2026-10-06T01:30:00+02:00"),
  ]);
  assert.deepEqual(counts, { "2026-10-05": 2, "2026-10-06": 2 });
  assert.deepEqual(Object.keys(counts), ["2026-10-05", "2026-10-06"]);
});

test("skips versions with missing or malformed timestamps", () => {
  const counts = countByDay([
    v("1", "2026-10-06T12:00:00Z"),
    v("2", "not a date"),
    { id: "3" } as FigmaVersion,
    v("4", "2026-02-29T12:00:00Z"), // not a leap year: Date.parse would say March 1
    v("5", "2026-04-31T00:00:00Z"),
    v("6", "2024-02-29T12:00:00Z"), // real leap day
  ]);
  assert.deepEqual(counts, { "2024-02-29": 1, "2026-10-06": 1 });
});

test("sums files into daily totals, sorted by date", () => {
  const totals = sumDays([
    { key: "A", name: "A", days: { "2026-10-06": 2, "2026-10-01": 1 } },
    { key: "B", name: "B", days: { "2026-10-06": 3, "2026-09-30": 4 } },
  ]);
  assert.deepEqual(totals, { "2026-09-30": 4, "2026-10-01": 1, "2026-10-06": 5 });
  assert.deepEqual(Object.keys(totals), ["2026-09-30", "2026-10-01", "2026-10-06"]);
});
