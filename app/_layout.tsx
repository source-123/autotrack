import "../global.css";
import "../lib/logbox";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../lib/authStore";
import { useFirebaseSync } from "../lib/useFirebaseSync";
import { useNotifications } from "../lib/useNotifications";
import { useNativeWindTheme } from "../lib/useNativeWindTheme";
import { useRTL } from "../lib/useRTL";
import { Sidebar } from "../components/Sidebar";
import { usePremiumSubscription } from "../lib/usePremiumSubscription";
import { useWelcomeStore } from "../lib/welcomeStore";
import { checkGoogleRedirectResult, configureGoogleSignIn } from "../lib/googleAuth";
import { useOnboardingStore } from "../lib/onboardingStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, _init } = useAuthStore();
  const { completed } = useOnboardingStore();
  const isNavigatingRef = useRef(false);

  // Vérifier le résultat d'une redirection Google
  useEffect(() => {
    checkGoogleRedirectResult().then(({ user, error }) => {
      if (user) {
        console.log("✅ Google redirect success:", user.email);
      } else if (error) {
        console.warn("❌ Google redirect error:", error);
      }
    });
  }, []);

  useEffect(() => {
    configureGoogleSignIn();
    _init();
  }, [_init]);

  useNativeWindTheme();
  useRTL();
  usePremiumSubscription();
  useFirebaseSync();
  useNotifications();

  useEffect(() => {
    if (loading) return;
    if (isNavigatingRef.current) return;

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === "(auth)";
    const inWelcome = currentSegment === "welcome";
    const inOnboarding = currentSegment === "onboarding";

    const state = useWelcomeStore.getState();
    const hasSeenWelcome = user ? state.hasSeen(user.uid) : false;
    const dismissed = state.dismissedInSession;

    if (!user) {
      if (dismissed) {
        useWelcomeStore.getState().resetDismiss();
      }
      if (!inAuthGroup) {
        isNavigatingRef.current = true;
        router.replace("/(auth)/login");
        setTimeout(() => { isNavigatingRef.current = false; }, 500);
      }
      return;
    }

    if (inWelcome || inOnboarding) return;

    if (inAuthGroup) {
      isNavigatingRef.current = true;
      if (!hasSeenWelcome && !dismissed) {
        router.replace("/welcome");
      } else if (!completed) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
      setTimeout(() => { isNavigatingRef.current = false; }, 800);
      return;
    }

    if (!hasSeenWelcome && !dismissed) {
      isNavigatingRef.current = true;
      router.replace("/welcome");
      setTimeout(() => { isNavigatingRef.current = false; }, 800);
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
        <Stack.Screen name="welcome" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="help" />
        <Stack.Screen name="settings" />
      </Stack>
      <Sidebar />
    </SafeAreaProvider>
  );
}
