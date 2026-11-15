import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  filterRecords,
  validate,
  localDate,
  shift,
} from "../src/models/healthRecords.ts";

import { initialize, repository } from "../src/database/healthRepository.ts";
import { calendarPeriod, summarizeInsights } from "../src/models/insights.ts";

test("insight periods use Monday weeks and whole calendar months and years", () => {
  assert.deepEqual(calendarPeriod("Weekly", "2023-01-01"), { start: "2022-12-26", end: "2023-01-01" });
  assert.deepEqual(calendarPeriod("Weekly", "2023-01-01", 1), { start: "2023-01-02", end: "2023-01-08" });
  assert.deepEqual(calendarPeriod("Monthly", "2024-03-31", -1), { start: "2024-02-01", end: "2024-02-29" });
  assert.deepEqual(calendarPeriod("Yearly", "2024-02-29", -1), { start: "2023-01-01", end: "2023-12-31" });
});

test("monthly insights merge repeated dates, count zero days and clip partial weeks", () => {
  const rows = [
    { id: 1, date: "2026-08-01", steps: 20, calories: 5, water: 7 },
    { id: 2, date: "2026-08-01", steps: 40, calories: 7, water: 9 },
    { id: 3, date: "2026-08-03", steps: 0, calories: 0, water: 0 },
    { id: 4, date: "2026-08-31", steps: 30, calories: 3, water: 2 },
    { id: 5, date: "2026-09-01", steps: 1000, calories: 50, water: 200 },
  ];
  const result = summarizeInsights(rows, "Monthly", calendarPeriod("Monthly", rows[0].date));
  assert.deepEqual(result.totals, { steps: 90, calories: 15, water: 18 });
  assert.deepEqual(result.averages, { steps: 30, calories: 5, water: 6 });
  assert.equal(result.days.length, 3);
  assert.equal(result.best.steps, 60);
  assert.deepEqual(result.buckets.map(b => [b.days, b.steps]), [[1,60], [1,0], [0,0], [0,0], [0,0], [1,30]]);
  assert.equal(result.buckets[0].end, "2026-08-02");
  assert.equal(result.buckets[5].end, "2026-08-31");
});

test("chart grouping adapts to custom date ranges and includes both endpoints", () => {
  for (const [start, end, grouping] of [
    ["2024-02-29", "2024-02-29", "day"],
    ["2024-02-23", "2024-03-07", "day"],
    ["2024-02-23", "2024-03-08", "week"],
    ["2023-12-20", "2024-05-02", "month"],
    ["2021-12-31", "2026-01-01", "year"],
  ]) {
    const rows = [start, end].map((date, id) => ({ id, date, steps: 1, calories: 2, water: 3 }));
    const result = summarizeInsights(rows, "Custom Range", { start, end });
    assert.equal(result.grouping, grouping);
    assert.equal(result.buckets[0].start, start);
    assert.equal(result.buckets.at(-1).end, end);
    assert.equal(result.buckets.reduce((sum, b) => sum + b.steps, 0), 2);
    assert.equal(result.days.length, new Set([start, end]).size);
  }
});

test("SQLite creates, edits and deletes feed weekly and yearly insights", async t => {
  const db = open(":memory:");
  t.after(() => db.close());
  await initialize(db.adapter);
  const period = calendarPeriod("Yearly", draft.date);
  const year = async () => summarizeInsights(await db.repo.all(), "Yearly", period);
  const id = await db.repo.save(draft);
  const first = await year();
  assert.equal(first.buckets.length, 12);
  assert.equal(first.buckets[3].steps, 6500);
  await db.repo.save({ ...draft, date: "2025-05-05", steps: "100" }, id);
  const updated = await year();
  assert.equal(updated.buckets[3].days, 0);
  assert.equal(updated.buckets[4].steps, 100);
  const week = summarizeInsights(await db.repo.all(), "Weekly", calendarPeriod("Weekly", "2025-05-05"));
  assert.deepEqual(week.buckets.map(b => b.steps), [100,0,0,0,0,0,0]);
  await db.repo.remove(id);
  assert.equal((await year()).days.length, 0);
});

// Exercise the app's production SQL with a real, file-backed SQLite database.
function open(path) {
  const connection = new DatabaseSync(path);
  const adapter = {
    execAsync: async (sql) => connection.exec(sql),
    getFirstAsync: async (sql, ...args) => connection.prepare(sql).get(...args),
    getAllAsync: async (sql, ...args) => connection.prepare(sql).all(...args),
    runAsync: async (sql, ...args) => {
      const { changes, lastInsertRowid } = connection.prepare(sql).run(...args);
      return {
        changes: Number(changes),
        lastInsertRowId: Number(lastInsertRowid),
      };
    },
    async withExclusiveTransactionAsync(action) {
      connection.exec("BEGIN EXCLUSIVE");
      try {
        await action(adapter);
        connection.exec("COMMIT");
      } catch (error) {
        connection.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return {
    adapter,
    repo: repository(adapter),
    close: () => connection.close(),
  };
}
const draft = {
  date: "2025-04-10",
  steps: "6500",
  calories: "350",
  water: "1800",
};
test("create, edit, reopen and delete a record without reseeding", async (t) => {
  // One recent development day overlaps the fixed coursework example.
  t.mock.timers.enable({ apis: ["Date"], now: new Date(2026, 7, 20, 12) });
  const dir = mkdtempSync(join(tmpdir(), "healthmate-"));
  const file = join(dir, "health.db");
  let db = open(file);
  t.after(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  await initialize(db.adapter, true);
  assert.equal((await db.repo.all()).length, 9);
  assert.equal((await db.repo.byDate("2026-08-18")).steps, 7850);
  const id = await db.repo.save(draft);
  await assert.rejects(db.repo.save(draft), /UNIQUE/);
  await db.repo.save(
    { ...draft, date: shift(draft.date, -1), water: "2200" },
    id,
  );
  await db.repo.set("goals", '{"steps":9000,"calories":500,"water":2000}');
  const profile = { name: "Sam", photo: "data:image/jpeg;base64,/9j/2Q==" };
  await db.repo.set("profile", JSON.stringify(profile));
  db.close();
  db = open(file);
  await initialize(db.adapter, true);
  const rows = await db.repo.all();
  assert.equal(rows.length, 10);
  const edited = rows.find((r) => r.id === id);
  assert.equal(edited.water, 2200);
  assert.equal(edited.date, shift(draft.date, -1));
  const settings = Object.fromEntries(
    (await db.repo.prefs()).map((item) => [item.key, JSON.parse(item.value)]),
  );
  assert.equal(settings.goals.steps, 9000);
  assert.deepEqual(settings.profile, profile);
  for (const row of rows) await db.repo.remove(row.id);
  await initialize(db.adapter, true);
  assert.deepEqual(await db.repo.all(), []);
});
test("form accepts zero and the upper bounds", () => {
  for (const d of [
    { steps: "0", calories: "0", water: "0" },
    { steps: "100000", calories: "20000", water: "20000" },
  ])
    assert.deepEqual(validate({ ...draft, ...d }, []), {});
});
test("empty, non-integer and out-of-range fields get individual errors", () => {
  assert.deepEqual(
    Object.keys(
      validate({ ...draft, steps: "", calories: "3.5", water: "20001" }, []),
    ).sort(),
    ["calories", "steps", "water"],
  );
});
test("negative and non-numeric values are rejected", () => {
  assert.ok(validate({ ...draft, steps: "-2" }, []).steps);
  assert.ok(validate({ ...draft, calories: "abc" }, []).calories);
});
test("future and impossible dates are rejected", () => {
  for (const date of [shift(localDate(), 1), "2025-02-30", "not a date"])
    assert.ok(validate({ ...draft, date }, []).date);
});
test("existing date blocks a new record but permits editing its owner", () => {
  const rows = [
    { id: 12, date: draft.date, steps: 6500, calories: 350, water: 1800 },
  ];
  assert.ok(validate(draft, rows).date);
  assert.deepEqual(validate(draft, rows, 12), {});
});

test("date search and inclusive range use the same records as the list", () => {
  const rows = ["2026-08-16", "2026-08-17", "2026-08-18"].map((date, id) => ({
    date,
    id,
    steps: 1,
    calories: 2,
    water: 3,
  }));
  assert.equal(
    filterRecords(rows, "18 Aug 2026", ["", ""])[0].date,
    "2026-08-18",
  );
  assert.equal(filterRecords(rows, "", ["2026-08-17", "2026-08-18"]).length, 2);
  assert.equal(
    filterRecords(rows, "18 Aug", ["2026-08-16", "2026-08-17"]).length,
    0,
  );
});

test("release install includes the exact scenario record, supports search and preserves ID rules", async () => {
  const db = open(":memory:");
  try {
    await initialize(db.adapter);
    const records = await db.repo.all();
    assert.equal(records.length, 1);
    const [sample] = filterRecords(records, "18 Aug 2026", ["", ""]);
    assert.deepEqual(
      { ...sample },
      { id: 1, date: "2026-08-18", steps: 7850, calories: 420, water: 2000 },
    );
    const { lastInsertRowId: id } = await db.adapter.runAsync(
      "INSERT INTO health_records(date) VALUES (?)",
      draft.date,
    );
    assert.deepEqual(
      { ...(await db.repo.byId(id)) },
      { id, date: draft.date, steps: 0, calories: 0, water: 0 },
    );
    assert.equal((await db.repo.byDate(draft.date)).id, id);
    assert.equal((await db.repo.between(draft.date, draft.date)).length, 1);
    await db.repo.remove(id);
    assert.ok((await db.repo.save(draft)) > id);
  } finally {
    db.close();
  }
});

test("upgrade keeps the original ID, measurements and reminder preference", async () => {
  const db = open(":memory:");
  try {
    await db.adapter.execAsync(
      "CREATE TABLE health_records(id INTEGER PRIMARY KEY, date TEXT UNIQUE, steps INTEGER, calories INTEGER, water INTEGER); CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT); PRAGMA user_version=1",
    );
    await db.adapter.runAsync(
      "INSERT INTO health_records VALUES (?,?,?,?,?)",
      42,
      draft.date,
      123,
      4,
      560,
    );
    await db.repo.set("reminder", "healthmate-daily");
    await initialize(db.adapter, true);
    assert.equal((await db.repo.all()).length, 2);
    assert.equal((await db.repo.byDate("2026-08-18")).water, 2000);
    assert.equal((await db.repo.byId(42)).water, 560);
    assert.equal((await db.repo.prefs())[0].value, "healthmate-daily");
  } finally {
    db.close();
  }
});

test("updating the previous release adds the example once and preserves an occupied date", async () => {
  const db = open(":memory:");
  try {
    await initialize(db.adapter);
    const original = await db.repo.byDate("2026-08-18");
    await db.repo.save(
      { ...draft, date: original.date, steps: "3333" },
      original.id,
    );
    await db.adapter.execAsync("PRAGMA user_version = 2");
    await initialize(db.adapter);
    assert.equal((await db.repo.byId(original.id)).steps, 3333);
    assert.equal((await db.repo.all()).length, 1);

    await db.repo.remove(original.id);
    await db.adapter.execAsync("PRAGMA user_version = 2");
    await initialize(db.adapter);
    const sample = await db.repo.byDate(original.date);
    assert.equal(sample.steps, 7850);
    await db.repo.remove(sample.id);
    await initialize(db.adapter);
    assert.deepEqual(await db.repo.all(), []);
  } finally {
    db.close();
  }
});
