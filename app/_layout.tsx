import "../global.css";
import "../lib/logbox";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../lib/authStore";
import { useFirebaseSync } from "../lib/useFirebaseSync";
import { useNotifications } from "../lib/useNotifications";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, _init } = useAuthStore();

  useEffect(() => {
    _init();
  }, [_init]);

  useFirebaseSync();
  useNotifications();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
