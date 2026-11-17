import { Pressable, View } from "react-native";
import { color, Icon, styles, AppText } from "../components/JournalUI";
export const tabs = ["home", "records", "add", "insights", "settings"] as const;
export type Tab = (typeof tabs)[number];
export function TabBar({
  page,
  change,
}: {
  page: string;
  change: (tab: Tab) => void;
}) {
  return (
    <View
      style={[
        styles.between,
        {
          minHeight: 74,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderColor: color.line,
          gap: 0,
        },
      ]}
    >
      {tabs.map((t) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: page === t }}
          key={t}
          onPress={() => change(t)}
          style={{ flex: 1, alignItems: "center", gap: 4 }}
        >
          <View
            style={[
              styles.center,
              {
                minWidth: 44,
                height: t === "add" ? 44 : 32,
                borderRadius: t === "add" ? 25 : 12,
                backgroundColor:
                  t === "add"
                    ? "#319D59"
                    : page === t
                      ? color.pale
                      : "transparent",
              },
            ]}
          >
            <Icon
              name={t}
              size={t === "add" ? 30 : 22}
              tint={
                t === "add" ? "white" : page === t ? color.green : color.muted
              }
            />
          </View>
          <AppText size={11} tint={page === t ? color.green : color.muted}>
            {t[0].toUpperCase() + t.slice(1)}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
