import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { calculateStats } from "./calculate.ts";
import { shiftToToday } from "./demo.ts";
import { sumDays, type ContributionData } from "./normalize.ts";

test("shifts every date so the latest is today, keeping counts and gaps", () => {
  const data: ContributionData = {
    files: [
      { key: "a", name: "A", days: { "2026-10-05": 2, "2026-10-06": 3 } },
      { key: "b", name: "B", days: { "2026-02-28": 1 } },
    ],
  };
  assert.deepEqual(shiftToToday(data, "2027-03-01"), {
    files: [
      { key: "a", name: "A", days: { "2027-02-28": 2, "2027-03-01": 3 } },
      { key: "b", name: "B", days: { "2026-07-24": 1 } },
    ],
  });
  assert.deepEqual(shiftToToday({ files: [] }, "2027-03-01"), { files: [] });
});

test("the committed demo data stays alive whenever it is shown", () => {
  const demo = JSON.parse(readFileSync(new URL("../../../data/demo.json", import.meta.url), "utf8")) as ContributionData;
  for (const today of ["2026-10-07", "2027-01-01", "2030-06-15"]) {
    const counts = sumDays(shiftToToday(demo, today).files);
    const stats = calculateStats(counts, today);
    assert.equal(stats.total, 2002, today);
    assert.ok(counts[today] > 0 && stats.currentStreak > 0, `${today}: active today with a live streak`);
  }
});
