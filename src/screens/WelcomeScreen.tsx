import { View } from "react-native";
import {
  ActionButton,
  Card,
  color,
  Icon,
  styles,
  AppText,
} from "../components/JournalUI";
import { metrics } from "../models/healthRecords";
export function Welcome({ start }: { start: () => void }) {
  return (
    <>
      <View style={[styles.row, { marginTop: 14 }]}>
        <Icon name="brand" size={88} />
        <AppText bold size={29} tint={color.green}>
          HealthMate
        </AppText>
      </View>
      <View style={{ gap: 12, marginVertical: 30 }}>
        <AppText bold size={38}>
          {"Take Control\nof Your Health."}
        </AppText>
        <AppText size={16} tint={color.muted}>
          A simple place for your daily movement, energy and hydration. Build
          healthy habits, one record at a time.
        </AppText>
      </View>
      {metrics.map((k, i) => (
        <Card
          key={k}
          style={{ backgroundColor: "#EBFDEC", borderColor: "#EBFDEC" }}
        >
          <View style={styles.row}>
            <Icon name={k} />
            <View style={{ gap: 6 }}>
              <AppText bold>
                {
                  [
                    "Track Your Steps.",
                    "Monitor Your Calories.",
                    "Stay Hydrated.",
                  ][i]
                }
              </AppText>
              <AppText size={13} tint={color.muted}>
                {
                  [
                    "Every step brings you closer.",
                    "Keep your daily energy in view.",
                    "Make room for a water break.",
                  ][i]
                }
              </AppText>
            </View>
          </View>
        </Card>
      ))}
      <View style={{ flex: 1, minHeight: 12 }} />
      <ActionButton label="Get Started" onPress={start} />
      <AppText style={{ textAlign: "center" }} tint={color.muted} size={12}>
        Your progress. At your pace.
      </AppText>
    </>
  );
}
