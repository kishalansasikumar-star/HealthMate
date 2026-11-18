import * as Notifications from "expo-notifications";

export type Reminder = { id: string; hour: number; minute: number };
export const defaultReminder: Reminder = { id: "", hour: 20, minute: 0 };

export function readReminder(value?: string): Reminder {
  if (!value) return defaultReminder;
  // Earlier releases saved only the scheduled notification ID.
  if (!value.startsWith("{")) return { ...defaultReminder, id: value };
  return JSON.parse(value);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

async function schedule({ id, hour, minute }: Reminder) {
  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title: "HealthMate", body: "Time for your daily check-in.", sound: "default" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: "daily" },
  });
}

export async function saveReminder(previous: Reminder, enabled: boolean, hour: number,
  minute: number, persist: (next: Reminder) => Promise<void>) {
  if (enabled) {
    await Notifications.setNotificationChannelAsync("daily", {
      name: "Daily check-in", importance: Notifications.AndroidImportance.DEFAULT, sound: "default",
    });
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.canAskAgain)
      permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted)
      throw Error("Allow notifications in your device settings to enable the reminder.");
  }
  const next = { id: enabled ? previous.id || "healthmate-daily" : "", hour, minute };
  if (previous.id) await Notifications.cancelScheduledNotificationAsync(previous.id);
  try {
    if (enabled) next.id = await schedule(next);
    await persist(next);
  } catch (error) {
    if (next.id) await Notifications.cancelScheduledNotificationAsync(next.id);
    if (previous.id) await schedule(previous);
    throw error;
  }
  return next;
}
