import { ProfileAvatar } from "../components/ProfileAvatar";
import appConfig from "../../app.json";
import { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Health } from "../viewmodels/useHealthViewModel";
import { metrics, limits, units } from "../models/healthRecords";
import {
  ActionButton,
  Card,
  color,
  Header,
  Icon,
  TextButton,
  styles,
  AppText,
  IconName,
} from "../components/JournalUI";
export type SettingsPage =
  | "settings"
  | "profile"
  | "goals"
  | "notifications"
  | "about";
export function Settings({
  vm,
  page,
  go,
  saved,
}: {
  vm: Health;
  page: SettingsPage;
  go: (p: SettingsPage) => void;
  saved: () => void;
}) {
  const [goals, setGoals] = useState(vm.goals);
  const [enabled, setEnabled] = useState(!!vm.reminder.id);
  const [time, setTime] = useState({ hour: vm.reminder.hour, minute: vm.reminder.minute });
  const timeLabel = (time.hour % 12 || 12) + ":" + String(time.minute).padStart(2, "0")
    + (time.hour < 12 ? " AM" : " PM");
  function pickTime() {
    const value = new Date();
    value.setHours(time.hour, time.minute, 0, 0);
    DateTimePickerAndroid.open({
      value, mode: "time", is24Hour: false,
      onValueChange: (_, date) => setTime({ hour: date.getHours(), minute: date.getMinutes() }),
    });
  }
  const back = () => go("settings");
  if (page === "goals")
    return (
      <>
        <Header
          title="Daily Goals"
          sub="Small goals can make a big difference."
          back={back}
        />
        <Card style={{ backgroundColor: color.pale }}>
          <AppText bold>Set a pace that feels right.</AppText>
          <AppText size={13}>
            These are personal targets, not medical advice.
          </AppText>
        </Card>
        {metrics.map((k) => {
          const step = { steps: 500, calories: 50, water: 250 }[k];
          const change = (d: number) =>
            setGoals({
              ...goals,
              [k]: Math.max(step, Math.min(limits[k], goals[k] + d)),
            });
          return (
            <Card key={k}>
              <AppText bold>
                Daily{" "}
                {{ steps: "step", calories: "calorie", water: "water" }[k]}{" "}
                target
              </AppText>
              <View style={styles.between}>
                <Pressable
                  accessibilityLabel={"Decrease " + k}
                  hitSlop={12}
                  onPress={() => change(-step)}
                >
                  <AppText size={24}>−</AppText>
                </Pressable>
                <AppText bold size={24}>
                  {goals[k].toLocaleString()}
                </AppText>
                <Pressable
                  accessibilityLabel={"Increase " + k}
                  hitSlop={12}
                  onPress={() => change(step)}
                >
                  <AppText size={24}>+</AppText>
                </Pressable>
              </View>
              <AppText size={12}>
                +{step} {units[k]} per tap · max {limits[k].toLocaleString()}
              </AppText>
            </Card>
          );
        })}
        <ActionButton
          label="Save Goals"
          disabled={vm.busy}
          onPress={() => void vm.saveGoals(goals, saved)}
        />
        <ActionButton outline label="Cancel" onPress={back} />
      </>
    );
  if (page === "notifications")
    return (
      <>
        <Header
          title="Notifications"
          sub="A gentle reminder, when you want it."
          back={vm.busy ? undefined : back}
        />
        <Card>
          <View style={styles.between}>
            <View>
              <AppText bold>Daily check-in reminder</AppText>
              <AppText size={13}>{enabled ? "Daily at " + timeLabel : "Daily reminders are off"}</AppText>
            </View>
            <Switch
              accessibilityLabel="Daily check-in reminder"
              disabled={vm.busy}
              value={enabled}
              onValueChange={setEnabled}
            />
          </View>
          {enabled && (
            <Pressable accessibilityRole="button" accessibilityLabel={"Reminder Time, " + timeLabel}
              disabled={vm.busy} onPress={pickTime} style={[styles.between, { minHeight: 48 }]}>
              <AppText bold>Reminder Time</AppText>
              <View style={styles.row}>
                <AppText tint={color.green}>{timeLabel}</AppText>
                <Icon name="chevron" size={16} />
              </View>
            </Pressable>
          )}
        </Card>
        <AppText size={13} tint={color.muted}>
          Reminders are optional. Health data stays on this device and is never
          sent in alerts.
        </AppText>
        <ActionButton label="Done" disabled={vm.busy}
          onPress={() => void vm.changeReminder(enabled, time.hour, time.minute, () => {
            back();
            vm.setNotice("Reminder saved");
          })} />
      </>
    );
  if (page === "about")
    return (
      <>
        <Header
          title="About HealthMate"
          sub="Your Health, Your Journey."
          back={back}
        />
        <View style={styles.center}>
          <Icon name="brand" size={80} />
          <AppText bold size={28}>
            HealthMate
          </AppText>
          <AppText>Version {appConfig.expo.version}</AppText>
        </View>
        <Card>
          <AppText bold>Your daily health journal</AppText>
          <AppText>
            Record steps, calories burned and water intake. Review your saved
            days and choose personal goals that work for you.
          </AppText>
        </Card>
        <Card>
          <AppText bold>Privacy, by design</AppText>
          <AppText>
            Health records are stored locally in SQLite on your device. No
            account or cloud sync is required.
          </AppText>
          <AppText>
            Deleting a record permanently removes it from your local history.
            Goals and reminder preferences use local app settings.
          </AppText>
        </Card>
        <AppText size={13}>HealthMate does not provide medical advice.</AppText>
        <ActionButton outline label="Back to Settings" onPress={back} />
      </>
    );
  return (
    <>
      <Header title="Settings" sub="Make HealthMate work for you." />
      <Card>
        <View style={styles.row}>
          <ProfileAvatar profile={vm.profile} size={54} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText bold size={20}>
              {vm.profile.name || "My profile"}
            </AppText>
            <AppText size={13} tint={color.muted}>
              Your personal health journal
            </AppText>
          </View>
          <TextButton label="Edit profile" onPress={() => go("profile")} />
        </View>
      </Card>
      <Card>
        <View style={styles.between}>
          <AppText bold>Daily health goals</AppText>
          <TextButton label="Edit goals" onPress={() => go("goals")} />
        </View>
        {metrics.map((k) => (
          <View key={k} style={styles.between}>
            <View style={styles.row}>
              <Icon name={k} />
              <AppText>
                {
                  {
                    steps: "Steps / day",
                    calories: "Calories · kcal",
                    water: "Water · ml",
                  }[k]
                }
              </AppText>
            </View>
            <AppText bold>{vm.goals[k].toLocaleString()}</AppText>
          </View>
        ))}
      </Card>
      {(
        [
          "Notification preferences",
          "About HealthMate",
          "Privacy information",
        ] as const
      ).map((label, i) => (
        <Pressable
          key={label}
          onPress={() => go(i ? "about" : "notifications")}
        >
          <Card>
            <View style={styles.between}>
              <View style={styles.row}>
                <Icon name={(["bell", "records", "check"] as IconName[])[i]} />
                <AppText bold>{label}</AppText>
              </View>
              <Icon name="chevron" size={16} />
            </View>
          </Card>
        </Pressable>
      ))}
      <View style={styles.center}>
        <AppText size={13}>HealthMate · Version {appConfig.expo.version}</AppText>
        <AppText size={12}>Designed for everyday wellbeing.</AppText>
        <AppText size={12}>Not a medical device or medical advice.</AppText>
      </View>
    </>
  );
}
