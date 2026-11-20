import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, color, Icon } from "./JournalUI";

const descriptions = {
  "Record saved": "Your new health record has been saved.",
  "Record updated": "Your changes have been saved.",
  "Record deleted": "The record has been removed from your history.",
  "Reminder saved": "Your reminder preferences have been saved.",
};

export function isToast(message: string): message is keyof typeof descriptions {
  return Object.prototype.hasOwnProperty.call(descriptions, message);
}

export function SuccessToast({ title }: { title: keyof typeof descriptions }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-18)).current;
  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, slide]);
  const deleted = title === "Record deleted";
  return (
    <View pointerEvents="none" style={[styles.overlay, { top: insets.top + 8, left: insets.left + 16, right: insets.right + 16 }]}>
      <Animated.View accessible accessibilityRole="alert" accessibilityLiveRegion="polite"
        accessibilityLabel={title + ". " + descriptions[title]}
        style={[styles.card, { opacity, transform: [{ translateY: slide }] }]}>
        <Icon name={deleted ? "trash" : "check"} tint={deleted ? color.red : color.green} />
        <View style={{ flex: 1, gap: 3 }}>
          <AppText bold>{title}</AppText>
          <AppText size={13} tint={color.muted}>{descriptions[title]}</AppText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", alignItems: "center", zIndex: 10 },
  card: { width: "100%", maxWidth: 420, flexDirection: "row", alignItems: "center",
    gap: 12, padding: 14, backgroundColor: "white", borderColor: color.line,
    borderWidth: 1, borderRadius: 14, elevation: 4 },
});
