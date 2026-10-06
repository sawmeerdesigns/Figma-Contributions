import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateStats, getLevel, rankProjects } from "./calculate.ts";
import type { FileContributions } from "./normalize.ts";

test("maps daily counts to levels (roadmap Phase 6 cases + boundaries)", () => {
  const cases: [number, number][] = [[0, 0], [2, 1], [5, 2], [10, 4], [1, 1], [3, 2], [6, 3], [9, 3], [50, 4]];
  for (const [count, level] of cases) assert.equal(getLevel(count), level, `count ${count}`);
});

test("totals, active days, most active day; zero-count days ignored", () => {
  const stats = calculateStats({ "2026-01-01": 2, "2026-01-02": 0, "2026-01-05": 7, "2026-01-06": 7 }, "2026-06-01");
  assert.equal(stats.total, 16);
  assert.equal(stats.activeDays, 3);
  assert.deepEqual(stats.mostActiveDay, { date: "2026-01-05", count: 7 });
  assert.deepEqual(stats.mostActiveMonth, { month: "2026-01", count: 16 });
  assert.equal(stats.longestStreak, 2);
  assert.equal(stats.currentStreak, 0);
});

test("streaks run across month ends and leap days", () => {
  const counts = { "2024-02-27": 1, "2024-02-28": 1, "2024-02-29": 1, "2024-03-01": 1, "2024-03-03": 1 };
  assert.equal(calculateStats(counts, "2024-03-03").longestStreak, 4);
  assert.equal(calculateStats({ "2025-12-31": 1, "2026-01-01": 1 }, "2026-01-01").currentStreak, 2);
});

test("current streak ends today or yesterday, otherwise it is 0", () => {
  const counts = { "2026-10-04": 3, "2026-10-05": 1 };
  assert.equal(calculateStats(counts, "2026-10-05").currentStreak, 2);
  assert.equal(calculateStats(counts, "2026-10-06").currentStreak, 2);
  assert.equal(calculateStats(counts, "2026-10-07").currentStreak, 0);
});

test("empty data", () => {
  assert.deepEqual(calculateStats({}, "2026-10-06"), {
    total: 0, activeDays: 0, currentStreak: 0, longestStreak: 0, mostActiveDay: null, mostActiveMonth: null,
  });
});

test("most active month sums the month; ties go to the earliest", () => {
  const counts = { "2026-08-01": 9, "2026-09-10": 5, "2026-09-11": 5, "2026-10-01": 10 };
  assert.deepEqual(calculateStats(counts, "2026-10-06").mostActiveMonth, { month: "2026-09", count: 10 });
});

test("ranks projects by versions in the year; ties by name; inactive files dropped", () => {
  const files: FileContributions[] = [
    { key: "p", name: "Portfolio", days: { "2026-01-02": 3, "2025-12-31": 50 } },
    { key: "h", name: "HRMS", days: { "2026-05-01": 7, "2026-05-02": 5 } },
    { key: "a", name: "Archive", days: { "2025-03-01": 9 } },
    { key: "c", name: "Club", days: { "2026-02-01": 3 } },
  ];
  assert.deepEqual(rankProjects(files, 2026), [
    { key: "h", name: "HRMS", count: 12 },
    { key: "c", name: "Club", count: 3 },
    { key: "p", name: "Portfolio", count: 3 },
  ]);
  assert.deepEqual(rankProjects(files, 2024), []);
});
