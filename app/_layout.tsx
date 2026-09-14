import "../global.css";
import { Stack } from "expo-router";
import { useFirebaseSync } from "../lib/useFirebaseSync";
import { useNotifications } from "../lib/useNotifications";

export default function RootLayout() {
  useFirebaseSync();     // Sync Firebase <-> Zustand
  useNotifications();    // Programme les rappels automatiquement

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
