import type { SQLiteDatabase } from "expo-sqlite";
import {
  localDate,
  shift,
  type Draft,
  type Entry,
} from "../models/healthRecords.ts";

const scenarioDate = "2026-08-18";

const createRecords = `CREATE TABLE health_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  steps INTEGER NOT NULL DEFAULT 0 CHECK(steps BETWEEN 0 AND 100000),
  calories INTEGER NOT NULL DEFAULT 0 CHECK(calories BETWEEN 0 AND 20000),
  water INTEGER NOT NULL DEFAULT 0 CHECK(water BETWEEN 0 AND 20000)
) STRICT`;

export async function initialize(
  db: SQLiteDatabase,
  seedDevelopmentData = false,
) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const version = (await tx.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    ))!.user_version;
    if (version === 3) return;
    if (version > 3)
      throw Error("This database requires a newer version of HealthMate.");
    if (version < 2) {
      const existing = await tx.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='health_records'",
      );
      if (existing)
        await tx.execAsync(
          "ALTER TABLE health_records RENAME TO legacy_records",
        );
      await tx.execAsync(createRecords);
      if (existing) {
        await tx.execAsync(`INSERT INTO health_records (id,date,steps,calories,water)
          SELECT id,date,steps,calories,water FROM legacy_records;
          DROP TABLE legacy_records;`);
      } else if (seedDevelopmentData) {
        const today = localDate();
        for (const [offset, steps, calories, water] of [
          [-10, 6100, 310, 1750],
          [-9, 7400, 425, 2100],
          [-7, 10350, 620, 2600],
          [-6, 4800, 280, 1600],
          [-5, 8200, 470, 2250],
          [-4, 10600, 610, 2500],
          [-3, 6500, 350, 1800],
          [-2, 9200, 510, 2500],
          [-1, 7850, 420, 2000],
        ]) {
          const date = shift(today, offset);
          if (date === scenarioDate) continue;
          await tx.runAsync(
            "INSERT INTO health_records(date,steps,calories,water) VALUES (?,?,?,?)",
            date,
            steps,
            calories,
            water,
          );
        }
      }
      await tx.execAsync(
        "CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)",
      );
    }
    await tx.runAsync(
      `INSERT INTO health_records(date,steps,calories,water) VALUES (?,?,?,?)
       ON CONFLICT(date) DO NOTHING`,
      scenarioDate,
      7850,
      420,
      2000,
    );
    await tx.execAsync("PRAGMA user_version = 3");
  });
}

export const repository = (db: SQLiteDatabase) => ({
  all: () =>
    db.getAllAsync<Entry>("SELECT * FROM health_records ORDER BY date DESC"),
  byId: (id: number) =>
    db.getFirstAsync<Entry>("SELECT * FROM health_records WHERE id=?", id),
  byDate: (date: string) =>
    db.getFirstAsync<Entry>("SELECT * FROM health_records WHERE date=?", date),
  between: (start: string, end: string) =>
    db.getAllAsync<Entry>(
      "SELECT * FROM health_records WHERE date BETWEEN ? AND ? ORDER BY date DESC",
      start || "0000-01-01",
      end || "9999-12-31",
    ),
  async save(d: Draft, id?: number) {
    const args = [d.date, Number(d.steps), Number(d.calories), Number(d.water)];
    if (id !== undefined) {
      const result = await db.runAsync(
        "UPDATE health_records SET date=?,steps=?,calories=?,water=? WHERE id=?",
        ...args,
        id,
      );
      if (!result.changes) throw Error("Record no longer exists.");
      return id;
    }
    return (
      await db.runAsync(
        "INSERT INTO health_records(date,steps,calories,water) VALUES (?,?,?,?)",
        ...args,
      )
    ).lastInsertRowId;
  },
  remove: (id: number) =>
    db.runAsync("DELETE FROM health_records WHERE id=?", id),
  prefs: () =>
    db.getAllAsync<{ key: string; value: string }>(
      "SELECT key,value FROM settings",
    ),
  set: (key: string, value: string) =>
    db.runAsync(
      "INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      key,
      value,
    ),
});
