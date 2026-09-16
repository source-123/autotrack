import { Pressable, Text, View, ActivityIndicator, Platform, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "../lib/useTranslation";
import {
  signInWithGoogleWeb,
  signInWithGoogleMobile,
  translateGoogleError,
  useGoogleAuth,
} from "../lib/googleAuth";

export function GoogleSignInButton() {
  const { lang } = useTranslation();
  const router = useRouter();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(false);

  const { promptAsync, response } = useGoogleAuth();

  // Réagir au retour de l'auth sur mobile
  if (Platform.OS !== "web" && response?.type === "success" && response.params?.id_token) {
    signInWithGoogleMobile(response.params.id_token).catch((e: any) => {
      Alert.alert("Erreur", translateGoogleError(e?.code || "", lang as any));
    });
  }

  const handlePress = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        await signInWithGoogleWeb();
        // Le layout racine gère la redirection
      } else {
        await promptAsync();
      }
    } catch (e: any) {
      if (e?.code !== "auth/popup-closed-by-user" && e?.code !== "auth/cancelled-popup-request") {
        Alert.alert(
          isAr ? "خطأ" : "Erreur",
          translateGoogleError(e?.code || "", lang as any)
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
          {/* Logo Google en SVG via View colored */}
          <View className="w-5 h-5 rounded-full" style={{ backgroundColor: "#4285F4" }} />
        </View>
      )}
      <Text className="text-slate-900 dark:text-white font-semibold text-sm">
        {loading
          ? isAr
            ? "جارٍ الاتصال..."
            : "Connexion..."
          : isAr
          ? "متابعة عبر Google"
          : "Continuer avec Google"}
      </Text>
    </Pressable>
  );
}
