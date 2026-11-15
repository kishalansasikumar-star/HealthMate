import { ProfileAvatar } from "../components/ProfileAvatar";
import { Pressable, View } from "react-native";
import {
  ActionButton,
  Card,
  color,
  TextButton,
  MetricCard,
  RecordCard,
  styles,
  AppText,
} from "../components/JournalUI";
import {
  Entry,
  localDate,
  metrics,
  pretty,
  zero,
} from "../models/healthRecords";
import { useHealth } from "../viewmodels/HealthContext";
import { AppState } from "react-native";
import { useEffect, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { completion } from "../models/healthRecords";
export function Dashboard({
  details,
  settings,
  records,
  add,
}: {
  details: (r: Entry) => void;
  settings: () => void;
  records: () => void;
  add: () => void;
}) {
  const vm = useHealth();
  const [today, setToday] = useState(localDate);
  useEffect(() => {
    const update = () => setToday(localDate());
    const timer = setInterval(update, 60000);
    const sub = AppState.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  const amount = vm.rows.find((r) => r.date === today) ?? zero;
  return (
    <>
      <View style={styles.between}>
        <View style={{ flex: 1, gap: 3 }}>
          <AppText tint={color.muted}>
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 18
                ? "Good afternoon"
                : "Good evening"}
          </AppText>
          <AppText size={30} bold>
            {vm.profile.name || "My journal"}
          </AppText>
          <AppText size={12} tint={color.muted}>
            {pretty(today, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </AppText>
        </View>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={settings}
        >
          <ProfileAvatar profile={vm.profile} />
        </Pressable>
      </View>
      <Card style={{ backgroundColor: color.green, borderColor: color.green }}>
        <View style={styles.between}>
          <View style={{ gap: 8, flex: 1 }}>
            <AppText size={11} tint="white">
              TODAY’S OVERVIEW
            </AppText>
            <AppText size={16} bold tint="white">
              A little more, a little healthier.
            </AppText>
            <AppText size={12} tint="white">
              Daily Goals Completed
            </AppText>
          </View>
          <View style={[styles.center, { width: 68, height: 68 }]}>
            <Svg width={68} height={68} style={{ position: "absolute" }}>
              <Circle
                cx="34"
                cy="34"
                r="30"
                stroke="#80AA8B"
                strokeWidth="5"
                fill="none"
              />
              <Circle
                cx="34"
                cy="34"
                r="30"
                stroke="white"
                strokeWidth="5"
                fill="none"
                strokeDasharray={[188.5, 188.5]}
                strokeDashoffset={
                  188.5 * (1 - completion(amount, vm.goals) / 100)
                }
                rotation="-90"
                origin="34,34"
              />
            </Svg>
            <AppText size={22} bold tint="white">
              {completion(amount, vm.goals)}%
            </AppText>
          </View>
        </View>
      </Card>
      {metrics.map((k) => (
        <MetricCard
          key={k}
          k={k}
          amount={amount}
          goals={vm.goals}
          showRemaining={k === "steps"}
        />
      ))}
      {vm.notice === "Record saved" && (
        <View style={styles.stack}>
          <AppText bold size={18}>
            Quick actions
          </AppText>
          <ActionButton
            label={
              vm.rows.some((row) => row.date === today)
                ? "View Today's Record"
                : "Add Today's Record"
            }
            onPress={() => {
              const current = vm.rows.find((row) => row.date === today);
              if (current) details(current);
              else add();
            }}
          />
        </View>
      )}
      <View style={styles.between}>
        <AppText bold size={19}>
          Recent activity
        </AppText>
        <TextButton label="View all records" onPress={records} />
      </View>
      {vm.rows.slice(0, 3).map((r) => (
        <RecordCard key={r.id} r={r} detail={() => details(r)} />
      ))}
      {!vm.rows.length && (
        <ActionButton label="Add your first record" onPress={add} />
      )}
    </>
  );
}
