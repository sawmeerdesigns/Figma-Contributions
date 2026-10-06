import assert from "node:assert/strict";
import { test } from "node:test";
import type { FigmaVersion } from "../figma/types.ts";
import { countByDay } from "./normalize.ts";

const v = (id: string, created_at: string) => ({ id, created_at }) as FigmaVersion;

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
  const counts = countByDay([v("1", "2026-10-06T12:00:00Z"), v("2", "not a date"), { id: "3" } as FigmaVersion]);
  assert.deepEqual(counts, { "2026-10-06": 1 });
});
