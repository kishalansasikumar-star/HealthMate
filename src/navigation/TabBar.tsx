import { Pressable, View } from "react-native";
import { color, Icon, styles, AppText } from "../components/JournalUI";

export const tabs = ["home", "records", "add", "insights", "settings"] as const;
export type Tab = (typeof tabs)[number];

type TabBarProps = {
  page: Tab;
  change: (tab: Tab) => void;
};

export function TabBar({ page, change }: TabBarProps) {
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
      {tabs.map((tab) => {
        const isSelected = page === tab;
        const isAdd = tab === "add";
        const tint = isSelected ? color.green : color.muted;
        const label = tab[0].toUpperCase() + tab.slice(1);

        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => change(tab)}
            style={{ flex: 1, alignItems: "center", gap: 4 }}
          >
            <View
              style={[
                styles.center,
                {
                  minWidth: 44,
                  height: isAdd ? 44 : 32,
                  borderRadius: isAdd ? 25 : 12,
                  backgroundColor: isAdd
                    ? "#319D59"
                    : isSelected
                      ? color.pale
                      : "transparent",
                },
              ]}
            >
              <Icon
                name={tab}
                size={isAdd ? 30 : 22}
                tint={isAdd ? "white" : tint}
              />
            </View>

            <AppText size={11} tint={tint}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}