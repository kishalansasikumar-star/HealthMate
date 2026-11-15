import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
  TextStyle,
  ViewStyle,
  StyleProp,
} from "react-native";
import {
  Amounts,
  Entry,
  Metric,
  labels,
  metrics,
  pretty,
  units,
} from "../models/healthRecords";
export const color = {
  bg: "#F7F9F8",
  ink: "#202A27",
  muted: "#5D6D65",
  green: "#207341",
  pale: "#EAF7EC",
  line: "#DFE8E2",
  red: "#C63C33",
  steps: "#207341",
  calories: "#FF5738",
  water: "#0089EF",
};
const symbols = {
  steps: "footsteps-outline",
  calories: "flame-outline",
  water: "water-outline",
  home: "home-outline",
  records: "reader-outline",
  insights: "bar-chart-outline",
  settings: "settings-outline",
  back: "chevron-back",
  calendar: "calendar-outline",
  chevron: "chevron-forward",
  search: "search-outline",
  edit: "create-outline",
  trash: "trash-outline",
  bell: "notifications-outline",
  check: "checkmark-circle-outline",
  person: "person-outline",
  trophy: "trophy-outline",
  add: "add",
} as const;

export type IconName = keyof typeof symbols | "brand";
export function Icon({
  name,
  size = 24,
  tint = color.ink,
}: {
  name: IconName;
  size?: number;
  tint?: string;
}) {
  if (name === "brand") {
    return (
      <Image
        source={require("../../assets/healthmate-logo.png")}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return <Ionicons name={symbols[name]} size={size} color={tint} />;
}
export function AppText({
  children,
  size = 15,
  bold = false,
  tint = color.ink,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  bold?: boolean;
  tint?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: tint,
          fontFamily: bold
            ? size >= 24
              ? "Inter_700Bold"
              : "Inter_600SemiBold"
            : "Inter_400Regular",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function ActionButton({
  label,
  onPress,
  outline = false,
  danger = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const ink = danger ? color.red : color.green;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: ink,
          backgroundColor: outline ? "white" : ink,
          opacity: disabled || pressed ? 0.65 : 1,
        },
      ]}
    >
      <AppText bold tint={outline ? ink : "white"}>
        {label}
      </AppText>
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  tint,
  style,
  disabled = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  tint?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={[styles.tap, style, disabled && { opacity: 0.3 }]}
    >
      <Icon name={name} size={21} tint={tint} />
    </Pressable>
  );
}
export function TextButton({
  label,
  onPress,
  centered,
}: {
  label: string;
  onPress: () => void;
  centered?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={7}>
      <AppText size={13} bold tint={color.green} style={centered && { textAlign: "center" }}>
        {label}
      </AppText>
    </Pressable>
  );
}
export function Header({
  title,
  sub,
  back,
  circularBack,
}: {
  title: string;
  sub: string;
  back?: () => void;
  circularBack?: boolean;
}) {
  return (
    <View style={{ gap: 9, marginBottom: 12 }}>
      <View style={styles.row}>
        {back && (
          <IconButton
            name="back"
            label="Go back"
            onPress={back}
            style={circularBack && styles.circularBack}
          />
        )}
        <AppText size={back ? 24 : 27} bold>
          {title}
        </AppText>
      </View>
      <AppText tint={color.muted}>{sub}</AppText>
    </View>
  );
}
export function MetricCard({
  k,
  amount,
  goals,
  showRemaining = false,
}: {
  k: Metric;
  showRemaining?: boolean;
  amount: Amounts;
  goals: Amounts;
}) {
  const pc = Math.round((amount[k] / goals[k]) * 100);
  return (
    <Card
      style={{
        borderColor: color[k] + "66",
        backgroundColor: {
          steps: "#FFFFFF",
          calories: "#FFFAF8",
          water: "#F5F8FF",
        }[k],
        padding: 14,
      }}
    >
      <View style={styles.between}>
        <View style={styles.row}>
          <View style={[styles.symbol, { backgroundColor: color[k] + "19" }]}>
            <Icon name={k} tint={color[k]} />
          </View>
          <View>
            <AppText size={13} bold>
              {labels[k]}
            </AppText>
            <View style={styles.row}>
              <AppText bold size={28}>
                {amount[k].toLocaleString()}
              </AppText>
              <AppText size={12} tint={color.muted}>
                {units[k]}
              </AppText>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 7 }}>
          <AppText size={12}>Goal {goals[k].toLocaleString()}</AppText>
          <AppText size={12}>{pc}%</AppText>
        </View>
      </View>
      <View style={styles.track}>
        <View
          style={{
            width: `${Math.min(100, pc)}%`,
            flex: 1,
            backgroundColor: color[k],
            borderRadius: 5,
          }}
        />
      </View>
      {showRemaining && (
        <AppText size={11} tint={color.muted}>
          {Math.max(0, goals[k] - amount[k]).toLocaleString()} steps to your
          goal
        </AppText>
      )}
    </Card>
  );
}
export function RecordCard({
  r,
  detail,
  edit,
  remove,
}: {
  r: Entry;
  detail: () => void;
  edit?: () => void;
  remove?: () => void;
}) {
  return (
    <Card>
      <Pressable accessibilityRole="button" onPress={detail}>
        <View style={styles.between}>
          <AppText bold size={edit ? 18 : 15}>
            {pretty(r.date)}
          </AppText>
          {edit && <Icon name="chevron" size={16} />}
        </View>
        {edit && (
          <AppText size={12} tint={color.muted}>
            {pretty(r.date, { weekday: "long" })} · Record #
            {String(r.id).padStart(3, "0")}
          </AppText>
        )}
        <View style={[styles.between, { marginTop: 13 }]}>
          {metrics.map((k) => (
            <View key={k} style={styles.row}>
              <Icon name={k} size={17} tint={color[k]} />
              <View>
                <AppText bold size={15}>
                  {r[k]}
                </AppText>
                <AppText size={11} tint={color.muted}>
                  {units[k]}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
      {edit && remove && (
        <View style={styles.between}>
          <TextButton label="View details" onPress={detail} />
          <View style={styles.row}>
            <IconButton name="edit" label="Edit record" onPress={edit} />
            <IconButton
              name="trash"
              label="Delete record"
              onPress={remove}
              tint={color.red}
            />
          </View>
        </View>
      )}
    </Card>
  );
}
export const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 15,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  tap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  circularBack: {
    borderRadius: 20,
    backgroundColor: color.pale,
    borderWidth: 1,
    borderColor: color.line,
  },
  symbol: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    height: 6,
    backgroundColor: "#E7ECE9",
    borderRadius: 6,
    marginTop: 4,
    overflow: "hidden",
  },
  input: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: color.ink,
    minHeight: 54,
    flex: 1,
    paddingHorizontal: 4,
  },
  field: {
    backgroundColor: "white",
    borderColor: color.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 56,
  },
  center: { alignItems: "center", justifyContent: "center", gap: 14 },
  stack: { gap: 14 },
});
