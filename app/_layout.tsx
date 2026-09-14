import "../global.css";
import "../lib/logbox";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../lib/authStore";
import { useFirebaseSync } from "../lib/useFirebaseSync";
import { useNotifications } from "../lib/useNotifications";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, _init } = useAuthStore();

  // Initialise l'écoute Firebase Auth
  useEffect(() => {
    _init();
  }, [_init]);

  // Active la sync Firebase + notifications (seulement si connecté)
  useFirebaseSync();
  useNotifications();

  // Redirection selon l'état d'auth
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
