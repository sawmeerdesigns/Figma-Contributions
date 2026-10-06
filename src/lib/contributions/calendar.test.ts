import assert from "node:assert/strict";
import { test } from "node:test";
import { buildYearCalendar, type YearCalendar } from "./calendar.ts";

const at = (cal: YearCalendar, date: string) => {
  for (const [w, week] of cal.weeks.entries()) {
    const r = week.findIndex((d) => d?.date === date);
    if (r !== -1) return [w, r];
  }
};

// Every date of the year appears once, in order, in the row matching its weekday.
function assertWellFormed(cal: YearCalendar, year: number, weekStart: 0 | 1, dayCount: number) {
  const days = cal.weeks.flatMap((week, w) => week.map((d, r) => d && { ...d, w, r })).filter((d) => d !== null);
  assert.equal(days.length, dayCount);
  assert.ok(cal.weeks.every((week) => week.length === 7));
  days.forEach((d, i) => {
    const expected = new Date(Date.UTC(year, 0, 1 + i));
    assert.equal(d.date, expected.toISOString().slice(0, 10));
    assert.equal(d.r, (expected.getUTCDay() - weekStart + 7) % 7);
  });
  assert.ok(cal.weeks[0].some(Boolean) && cal.weeks.at(-1)!.some(Boolean), "no empty edge columns");
}

test("normal year (2026 starts on Thursday)", () => {
  const cal = buildYearCalendar({}, 2026);
  assertWellFormed(cal, 2026, 0, 365);
  assert.equal(cal.weeks.length, 53);
  assert.deepEqual(cal.weeks[0].slice(0, 4), [null, null, null, null]);
  assert.deepEqual(at(cal, "2026-01-01"), [0, 4]);
  assert.deepEqual(at(cal, "2026-12-31"), [52, 4]);
  assert.deepEqual(cal.weeks[52].slice(5), [null, null]);
});

test("leap year (2024 starts on Monday) includes Feb 29", () => {
  const cal = buildYearCalendar({}, 2024);
  assertWellFormed(cal, 2024, 0, 366);
  assert.ok(at(cal, "2024-02-29"));
  assert.equal(at(cal, "2025-01-01"), undefined, "next year's days are not included");
});

test("years starting on every weekday, both week conventions", () => {
  // 2023 Sun, 2024 Mon (leap), 2019 Tue, 2020 Wed (leap), 2026 Thu, 2021 Fri, 2022 Sat, 2028 Sat (leap), 2000 Sat (leap)
  for (const year of [2023, 2024, 2019, 2020, 2026, 2021, 2022, 2028, 2000]) {
    const leap = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1;
    for (const weekStart of [0, 1] as const) assertWellFormed(buildYearCalendar({}, year, weekStart), year, weekStart, leap ? 366 : 365);
  }
  assert.equal(buildYearCalendar({}, 2028, 0).weeks.length, 54, "leap year starting Saturday needs 54 Sunday-start columns");
  assert.equal(buildYearCalendar({}, 2023, 0).weeks.length, 53);
});

test("Monday start shifts rows", () => {
  const cal = buildYearCalendar({}, 2026, 1);
  assert.deepEqual(at(cal, "2026-01-01"), [0, 3]);
  assert.deepEqual(at(cal, "2026-01-05"), [1, 0]);
});

test("fills counts and levels; missing days are 0; other years ignored", () => {
  const cal = buildYearCalendar({ "2025-12-31": 4, "2026-01-01": 2, "2026-01-02": 12 }, 2026);
  const days = cal.weeks.flat().filter((d) => d !== null);
  assert.deepEqual(days.slice(0, 3), [
    { date: "2026-01-01", count: 2, level: 1 },
    { date: "2026-01-02", count: 12, level: 4 },
    { date: "2026-01-03", count: 0, level: 0 },
  ]);
  assert.equal(days.reduce((sum, d) => sum + d.count, 0), 14);
});

test("month label columns", () => {
  const { months } = buildYearCalendar({}, 2026);
  assert.equal(months.length, 12);
  assert.deepEqual(months[0], { month: 0, week: 0 });
  assert.deepEqual(months[1], { month: 1, week: 5 }); // Feb 1 2026 is a Sunday: first slot of column 5
  assert.deepEqual(months[11], { month: 11, week: 48 });
});
