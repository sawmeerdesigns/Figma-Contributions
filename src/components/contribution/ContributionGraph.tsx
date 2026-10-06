"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Level } from "@/lib/contributions/calculate";
import type { ContributionDay, YearCalendar } from "@/lib/contributions/calendar";

const LEVELS: Level[] = [0, 1, 2, 3, 4];
// Sunday-start rows (buildYearCalendar default); label every other row like GitHub.
const ROW_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const monthName = (month: number) =>
  new Date(Date.UTC(2000, month, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

export function describeDay({ date, count }: ContributionDay) {
  const when = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${count === 0 ? "No" : count} version${count === 1 ? "" : "s"} on ${when}`;
}

function Cell({ level }: { level: Level }) {
  return <span className="block size-[11px] rounded-[2px]" style={{ background: `var(--level-${level})` }} />;
}

export function ContributionLegend() {
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-500" aria-hidden>
      Less
      {LEVELS.map((level) => (
        <Cell key={level} level={level} />
      ))}
      More
    </div>
  );
}

export function ContributionGraph({ weeks, months, year }: YearCalendar & { year: number }) {
  const tableRef = useRef<HTMLTableElement>(null);
  // Roving tabindex: the grid is one tab stop, arrow keys move between days.
  const firstDay = weeks[0].findIndex(Boolean);
  const [focus, setFocus] = useState<[number, number]>([0, firstDay]);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  // When the graph is narrower than the year (phones), start scrolled to today's week, like GitHub.
  useEffect(() => {
    const box = tableRef.current?.parentElement;
    const today = tableRef.current?.querySelector(`[data-date="${new Date().toISOString().slice(0, 10)}"]`);
    if (box && today) box.scrollLeft += today.getBoundingClientRect().right - box.getBoundingClientRect().right + 24;
  }, []);

  const show = (day: ContributionDay, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setTip({ text: describeDay(day), x: r.left + r.width / 2, y: r.top });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const move = ARROWS[e.key];
    if (!move) return;
    e.preventDefault();
    const [w, r] = [focus[0] + move[0], focus[1] + move[1]];
    if (!weeks[w]?.[r]) return; // padding slot or outside the grid
    setFocus([w, r]);
    tableRef.current?.querySelector<HTMLElement>(`[data-pos="${w}-${r}"]`)?.focus();
  };

  // Month label spans; skip a label too narrow to fit (e.g. a month starting in the last column).
  const spans = months.map((m, i) => ({ ...m, span: (months[i + 1]?.week ?? weeks.length) - m.week }));

  return (
    <div className="overflow-x-auto pb-1">
      <table
        ref={tableRef}
        role="grid"
        aria-label={`Figma contributions in ${year}`}
        aria-readonly
        onKeyDown={onKeyDown}
        className="border-separate border-spacing-[3px] text-xs text-zinc-500"
      >
        <thead>
          <tr>
            <td className="sticky left-0 bg-background" />
            {spans[0].week > 0 && <td colSpan={spans[0].week} />}
            {spans.map((m) => (
              <th key={m.month} colSpan={m.span} scope="colgroup" className="text-left font-normal">
                {m.span >= 2 ? monthName(m.month) : <span className="sr-only">{monthName(m.month)}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROW_LABELS.map((label, r) => (
            <tr key={r}>
              <td className="sticky left-0 bg-background pr-1 leading-none" aria-hidden>
                {label}
              </td>
              {weeks.map((week, w) => {
                const day = week[r];
                if (!day) return <td key={w} />;
                const active = focus[0] === w && focus[1] === r;
                return (
                  <td
                    key={w}
                    role="gridcell"
                    data-pos={`${w}-${r}`}
                    data-date={day.date}
                    tabIndex={active ? 0 : -1}
                    aria-label={describeDay(day)}
                    onMouseEnter={(e) => show(day, e.currentTarget)}
                    onMouseLeave={() => setTip(null)}
                    onFocus={(e) => {
                      setFocus([w, r]);
                      show(day, e.currentTarget);
                    }}
                    onBlur={() => setTip(null)}
                    className="rounded-[2px] p-0 outline-offset-1 hover:outline hover:outline-1 hover:outline-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500"
                  >
                    <Cell level={day.level} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {tip && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow dark:bg-zinc-100 dark:text-zinc-900"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
