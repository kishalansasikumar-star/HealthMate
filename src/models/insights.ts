import {
  dayAt, localDate, metrics, pretty, shift, zero,
  type Amounts, type Entry,
} from "./healthRecords.ts";

export const insightFilters = ["Weekly", "Monthly", "Yearly", "Custom Range"] as const;
export type InsightFilter = (typeof insightFilters)[number];
export type Period = { start: string; end: string };
type Grouping = "day" | "week" | "month" | "year";

function monday(date: string) {
  return shift(date, -((dayAt(date).getDay() + 6) % 7));
}

function monthStart(date: string, offset = 0) {
  const first = dayAt(date.slice(0, 7) + "-01");
  first.setMonth(first.getMonth() + offset);
  return localDate(first);
}

export function calendarPeriod(filter: Exclude<InsightFilter, "Custom Range">, date: string, offset = 0): Period {
  if (filter === "Weekly") {
    const start = shift(monday(date), offset * 7);
    return { start, end: shift(start, 6) };
  }
  if (filter === "Monthly") {
    const start = monthStart(date, offset);
    return { start, end: shift(monthStart(start, 1), -1) };
  }
  const year = dayAt(date).getFullYear() + offset;
  return { start: year + "-01-01", end: year + "-12-31" };
}

export function rangeLabel({ start, end }: Period) {
  const full = { day: "numeric", month: "short", year: "numeric" } as const;
  if (start === end) return pretty(start, full);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return pretty(start, sameYear ? { day: "numeric", month: "short" } : full) + " – " + pretty(end, full);
}

function groupingFor(filter: InsightFilter, { start, end }: Period): Grouping {
  if (filter === "Weekly") return "day";
  if (filter === "Monthly") return "week";
  if (filter === "Yearly") return "month";
  if (end <= shift(start, 13)) return "day";
  if (end <= shift(start, 83)) return "week";
  if (end < monthStart(start, 24)) return "month";
  return "year";
}

function groupStart(date: string, grouping: Grouping) {
  if (grouping === "week") return monday(date);
  if (grouping === "month") return date.slice(0, 7) + "-01";
  if (grouping === "year") return date.slice(0, 4) + "-01-01";
  return date;
}

function nextGroup(start: string, grouping: Grouping) {
  if (grouping === "day") return shift(start, 1);
  if (grouping === "week") return shift(start, 7);
  return monthStart(start, grouping === "month" ? 1 : 12);
}

function chartLabel(start: string, grouping: Grouping, filter: InsightFilter, index: number) {
  if (grouping === "year") return start.slice(0, 4);
  if (grouping === "month") return pretty(start, { month: "short" });
  if (grouping === "week") return "W" + (index + 1);
  if (filter === "Weekly") return pretty(start, { weekday: "narrow" });
  return String(dayAt(start).getDate());
}

type DailyRecord = Amounts & { date: string };
type ChartBucket = Period & { label: string; steps: number; days: number };

export function summarizeInsights(rows: Entry[], filter: InsightFilter, period: Period) {
  const byDate = new Map<string, DailyRecord>();
  const totals = { ...zero };
  for (const row of rows) {
    if (row.date < period.start || row.date > period.end) continue;
    const day = byDate.get(row.date) ?? { date: row.date, ...zero };
    for (const key of metrics) {
      day[key] += row[key];
      totals[key] += row[key];
    }
    byDate.set(row.date, day);
  }
  const days = Array.from(byDate.values());
  const averages = { ...zero };
  if (days.length) {
    for (const key of metrics) averages[key] = Math.round(totals[key] / days.length);
  }

  const grouping = groupingFor(filter, period);
  const groups = new Map<string, ChartBucket>();
  let cursor = groupStart(period.start, grouping);
  while (cursor <= period.end) {
    const next = nextGroup(cursor, grouping);
    const last = shift(next, -1);
    groups.set(cursor, {
      start: cursor < period.start ? period.start : cursor,
      end: last > period.end ? period.end : last,
      label: chartLabel(cursor, grouping, filter, groups.size),
      steps: 0,
      days: 0,
    });
    cursor = next;
  }
  let best: DailyRecord | undefined;
  for (const day of days) {
    const bucket = groups.get(groupStart(day.date, grouping))!;
    bucket.steps += day.steps;
    bucket.days++;
    if (!best || day.steps > best.steps) best = day;
  }
  return { totals, days, averages, best, grouping, buckets: Array.from(groups.values()) };
}
