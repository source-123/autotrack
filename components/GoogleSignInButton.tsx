import { Pressable, Text, View, ActivityIndicator, Platform, Alert } from "react-native";
import { useState } from "react";
import { useTranslation } from "../lib/useTranslation";
import {
  signInWithGoogleWeb,
  signInWithGoogleMobile,
  translateGoogleError,
} from "../lib/googleAuth";

export function GoogleSignInButton() {
  const { lang } = useTranslation();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        await signInWithGoogleWeb();
      } else {
        await signInWithGoogleMobile();
      }
    } catch (e: any) {
      console.error("Google Sign-In error:", e);
      const code = e?.code || "";
      // Ne pas afficher d'erreur si l'utilisateur annule
      if (code !== "SIGN_IN_CANCELLED" && code !== "12501") {
        Alert.alert(
          isAr ? "خطأ" : "Erreur",
          translateGoogleError(code || e?.message || "", lang as any)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className="flex-row items-center justify-center gap-3 rounded-xl py-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 active:bg-slate-50 dark:active:bg-slate-700"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#2563eb" />
      ) : (
        <View className="w-6 h-6 items-center justify-center">
          <View className="w-5 h-5 rounded-full" style={{ backgroundColor: "#4285F4" }} />
        </View>
      )}
      <Text className="text-slate-900 dark:text-white font-semibold text-sm">
        {loading
          ? isAr ? "جارٍ الاتصال..." : "Connexion..."
          : isAr ? "متابعة عبر Google" : "Continuer avec Google"}
      </Text>
    </Pressable>
  );
}
