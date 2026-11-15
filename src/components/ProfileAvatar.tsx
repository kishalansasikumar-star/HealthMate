import { Image, View } from "react-native";
import { Profile } from "../models/healthRecords";
import { color, Icon, styles, AppText } from "./JournalUI";

export function ProfileAvatar({
  profile,
  size = 48,
}: {
  profile: Profile;
  size?: number;
}) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (profile.photo)
    return (
      <Image
        source={{ uri: profile.photo }}
        style={shape}
        accessibilityLabel="Profile picture"
      />
    );

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();
  return (
    <View style={[styles.center, shape, { backgroundColor: color.pale }]}>
      {initials ? (
        <AppText size={size / 3} bold tint={color.green}>
          {initials}
        </AppText>
      ) : (
        <Icon name="person" size={size / 2} tint={color.green} />
      )}
    </View>
  );
}
