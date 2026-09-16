import "../global.css";
import "../lib/logbox";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../lib/authStore";
import { useFirebaseSync } from "../lib/useFirebaseSync";
import { useNotifications } from "../lib/useNotifications";
import { useNativeWindTheme } from "../lib/useNativeWindTheme";
import { useRTL } from "../lib/useRTL";
import { Sidebar } from "../components/Sidebar";
import { useOnboardingStore } from "../lib/onboardingStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, _init } = useAuthStore();
  const { completed, neverShow } = useOnboardingStore();

  useEffect(() => {
    _init();
  }, [_init]);

  useNativeWindTheme();
  useRTL();
  useFirebaseSync();
  useNotifications();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Après connexion : onboarding si première fois
      if (!completed) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, loading, segments, router, completed]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
      </Stack>
      <Sidebar />
    </SafeAreaProvider>
  );
}
