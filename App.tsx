import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SQLiteProvider, SQLiteDatabase } from "expo-sqlite";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { initialize } from "./src/database/healthRepository";
import { HealthProvider } from "./src/viewmodels/HealthContext";
import { Navigation } from "./src/navigation/AppNavigator";
import { ActionButton, AppText, color } from "./src/components/JournalUI";
const prepareDatabase = (db: SQLiteDatabase) => initialize(db, __DEV__);

export default function App() {
  const [fonts, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [databaseError, setDatabaseError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  if (!fonts && !fontError)
    return <ActivityIndicator style={{ flex: 1 }} color={color.green} />;
  if (databaseError)
    return (
      <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
        <AppText bold>HealthMate could not open your local database.</AppText>
        <AppText>{databaseError.message}</AppText>
        <ActionButton
          label="Retry"
          onPress={() => {
            setAttempt(attempt + 1);
            setDatabaseError(null);
          }}
        />
      </View>
    );
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        key={attempt}
        databaseName="healthmate.db"
        onInit={prepareDatabase}
        onError={setDatabaseError}
      >
        <HealthProvider>
          <Navigation />
        </HealthProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
