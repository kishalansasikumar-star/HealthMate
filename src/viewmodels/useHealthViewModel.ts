import { defaultReminder, readReminder, saveReminder } from "../models/dailyReminder";
import { isToast } from "../components/SuccessToast";
import { repository } from "../database/healthRepository";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  Amounts,
  Draft,
  Entry,
  Profile,
  emptyProfile,
  initialGoals,
  localDate,
  filterRecords,
  validate,
} from "../models/healthRecords";

export function useHealthViewModel() {
  const db = useSQLiteContext();
  const repo = useMemo(() => repository(db), [db]);
  const [rows, setRows] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Amounts>(initialGoals);
  const [reminder, setReminder] = useState(defaultReminder);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", id: 0 });
  const notice = message.text;
  function setNotice(text: string) {
    setMessage(current => ({ text, id: current.id + 1 }));
  }
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), isToast(notice) ? 3000 : 3200);
    return () => clearTimeout(timer);
  }, [message]);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    date: localDate(),
    steps: "",
    calories: "",
    water: "",
  });
  const [editId, setEditId] = useState<number>();
  async function refresh() {
    setRows(await repo.all());
  }
  async function load() {
    try {
      await refresh();
      const settings = Object.fromEntries(
        (await repo.prefs()).map((p) => [p.key, p.value]),
      );
      if (settings.goals) setGoals(JSON.parse(settings.goals));
      if (settings.profile) setProfile(JSON.parse(settings.profile));
      setReminder(readReminder(settings.reminder));
      setReady(true);
    } catch {
      setError("Could not read the local database. Please retry.");
    }
  }
  useEffect(() => {
    void load();
  }, [repo]);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not finish the operation. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function startForm(r?: Entry) {
    setEditId(r?.id);
    setSubmitted(false);
    setDraft(
      r
        ? {
            date: r.date,
            steps: String(r.steps),
            calories: String(r.calories),
            water: String(r.water),
          }
        : { date: localDate(), steps: "", calories: "", water: "" },
    );
  }
  async function save(done: (id: number) => void) {
    const result = validate(draft, rows, editId);
    setSubmitted(true);
    if (Object.keys(result).length) return;
    await run(async () => {
      const id = await repo.save(draft, editId);
      await refresh();
      done(id);
    });
  }
  const errors = submitted ? validate(draft, rows, editId) : {};
  const valid = Object.keys(validate(draft, rows, editId)).length === 0;
  const filtered = useMemo(
    () => filterRecords(rows, query, range),
    [rows, query, range],
  );
  return {
    rows,
    notice,
    noticeId: message.id,
    setNotice,
    ready,
    busy,
    error,
    setError,
    load,
    goals,
    profile,
    reminder,
    filtered,
    range,
    setRange,
    query,
    setQuery,
    errors,
    valid,
    draft,
    setDraft,
    editId,
    startForm,
    save,
    remove: (id: number, done: () => void) =>
      run(async () => {
        await repo.remove(id);
        await refresh();
        done();
      }),
    saveGoals: (g: Amounts, done: () => void) =>
      run(async () => {
        await repo.set("goals", JSON.stringify(g));
        setGoals(g);
        done();
      }),
    saveProfile: (updated: Profile, done: () => void) =>
      run(async () => {
        const name = updated.name.trim();
        if (!name || name.length > 40)
          throw Error("Enter a name with 1 to 40 characters.");
        const profile = { ...updated, name };
        await repo.set("profile", JSON.stringify(profile));
        setProfile(profile);
        done();
      }),
    changeReminder: (enabled: boolean, hour: number, minute: number, done: () => void) =>
      run(async () => {
        const next = await saveReminder(reminder, enabled, hour, minute, async setting => {
          await repo.set("reminder", JSON.stringify(setting));
        });
        setReminder(next);
        done();
      }),
  };
}
export type Health = ReturnType<typeof useHealthViewModel>;
