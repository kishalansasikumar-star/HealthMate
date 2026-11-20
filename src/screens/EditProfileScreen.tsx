import { useState } from "react";
import { TextInput, View } from "react-native";
import { launchImageLibraryAsync } from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { ProfileAvatar } from "../components/ProfileAvatar";
import {
  ActionButton,
  Card,
  color,
  Header,
  TextButton,
  styles,
  AppText,
} from "../components/JournalUI";
import { useHealth } from "../viewmodels/HealthContext";

export function EditProfileScreen({ back }: { back: () => void }) {
  const vm = useHealth();
  const [name, setName] = useState(vm.profile.name);
  const [photo, setPhoto] = useState(vm.profile.photo);
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState("");

  async function choosePhoto() {
    setPicking(true);
    setMessage("");
    try {
      const chosen = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (chosen.canceled) return;
      // A small JPEG fits in the profile's SQLite row and survives cache cleanup.
      const edit = ImageManipulator.manipulate(chosen.assets[0].uri);
      const thumbnail = await edit
        .resize({ width: 250, height: 256 })
        .renderAsync();
      try {
        const image = await thumbnail.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.8,
          base64: true,
        });
        if (!image.base64) throw Error("Could not read photo");
        setPhoto("data:image/jpeg;base64," + image.base64);
      } finally {
        thumbnail.release();
        edit.release();
      }
    } catch {
      setMessage(
        "That picture could not be opened. Please choose another photo.",
      );
    } finally {
      setPicking(false);
    }
  }

  function save() {
    if (!name.trim()) {
      setMessage("Enter your display name.");
      return;
    }
    void vm.saveProfile({ name, photo }, () => {
      vm.setNotice("Profile saved");
      back();
    });
  }

  return (
    <>
      <Header
        title="Edit profile"
        sub="Choose how you appear in your journal."
        back={back}
      />
      <Card style={{ alignItems: "center", gap: 16 }}>
        <ProfileAvatar profile={{ name, photo }} size={88} />
        <ActionButton
          outline
          disabled={picking || vm.busy}
          label={photo ? "Change picture" : "Choose a picture"}
          onPress={() => void choosePhoto()}
        />
        {photo && (
          <TextButton label="Remove picture" onPress={() => setPhoto(null)} />
        )}
      </Card>
      <AppText bold>Display name</AppText>
      <View style={styles.field}>
        <TextInput
          value={name}
          accessibilityLabel="Display name"
          maxLength={40}
          placeholder="Your name"
          placeholderTextColor={color.muted}
          autoCapitalize="words"
          onChangeText={(value) => {
            setName(value);
            setMessage("");
          }}
          style={styles.input}
        />
      </View>
      {!!message && (
        <AppText size={13} tint={color.red}>
          {message}
        </AppText>
      )}
      <ActionButton
        label="Save profile"
        disabled={picking || vm.busy}
        onPress={save}
      />
      <ActionButton outline label="Cancel" onPress={back} />
    </>
  );
}
