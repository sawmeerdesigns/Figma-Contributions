import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveYear } from "./years.ts";

const counts = { "2024-02-29": 3, "2026-10-06": 1 };

test("defaults to the latest year with data; offers every year up to now, gaps included", () => {
  assert.deepEqual(resolveYear(counts, undefined, 2026), { year: 2026, years: [2026, 2025, 2024] });
});

test("previous year, empty year and leap year can be opened", () => {
  assert.equal(resolveYear(counts, "2025", 2026).year, 2025); // previous + empty
  assert.equal(resolveYear(counts, "2024", 2026).year, 2024); // leap
});

test("an empty year before the data extends the list", () => {
  assert.deepEqual(resolveYear(counts, "2022", 2026).years, [2026, 2025, 2024, 2023, 2022]);
});

test("current year with no data yet", () => {
  assert.deepEqual(resolveYear({ "2025-12-31": 2 }, undefined, 2026), { year: 2025, years: [2026, 2025] });
  assert.deepEqual(resolveYear({}, undefined, 2026), { year: 2026, years: [2026] });
});

test("invalid, future and pre-Figma years fall back to the default", () => {
  for (const bad of ["2027", "1999", "abc", "2025.5", "", ["2025", "2024"]]) {
    assert.equal(resolveYear(counts, bad, 2026).year, 2026, String(bad));
  }
});
