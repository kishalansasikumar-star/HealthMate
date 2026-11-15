export const metrics = ["steps", "calories", "water"] as const;
export type Metric = (typeof metrics)[number];
export type Amounts = Record<Metric, number>;
export type Entry = Amounts & { id: number; date: string };
export type Profile = { name: string; photo: string | null };
export const emptyProfile: Profile = { name: "", photo: null };
export type Draft = Record<Metric | "date", string>;
export const limits: Amounts = { steps: 100000, calories: 20000, water: 20000 };
export const initialGoals: Amounts = {
  steps: 10000,
  calories: 600,
  water: 2500,
};
export const zero: Amounts = { steps: 0, calories: 0, water: 0 };
export const labels = {
  steps: "Steps",
  calories: "Calories Burned",
  water: "Water Intake",
};
export const units = { steps: "steps", calories: "kcal", water: "ml" };

export function localDate(day = new Date()) {
  return [
    day.getFullYear(),
    String(day.getMonth() + 1).padStart(2, "0"),
    String(day.getDate()).padStart(2, "0"),
  ].join("-");
}
export function dayAt(iso: string) {
  return new Date(iso + "T12:00:00");
}
export function shift(iso: string, days: number) {
  const d = dayAt(iso);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function pretty(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
) {
  return dayAt(iso).toLocaleDateString("en-GB", options);
}
export function validate(d: Draft, rows: Entry[], id?: number) {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(d.date) ||
    localDate(dayAt(d.date)) !== d.date
  )
    errors.date = "Choose a valid date.";
  else if (d.date > localDate()) errors.date = "Future dates are not allowed.";
  else if (rows.some((r) => r.date === d.date && r.id !== id))
    errors.date = "A record already exists. Edit it instead.";
  for (const k of metrics) {
    if (!d[k].trim()) errors[k] = labels[k] + " is required.";
    else if (!/^\d+$/.test(d[k]) || Number(d[k]) > limits[k])
      errors[k] =
        "Enter a whole number from 0 to " + limits[k].toLocaleString() + ".";
  }
  return errors;
}
export function filterRecords(
  rows: Entry[],
  query: string,
  range: [string, string],
) {
  return rows.filter((r) => {
    const text = [
      r.date,
      pretty(r.date),
      pretty(r.date, { day: "numeric", month: "short", year: "numeric" }),
      pretty(r.date, { weekday: "long" }),
    ]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(query.trim().toLowerCase()) &&
      (!range[0] || r.date >= range[0]) &&
      (!range[1] || r.date <= range[1])
    );
  });
}

export function completion(values: Amounts, goals: Amounts) {
  const total = metrics.reduce(
    (sum, key) => sum + Math.min(1, values[key] / goals[key]),
    0,
  );
  return Math.round((total * 100) / metrics.length);
}
