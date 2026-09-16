import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Lock, Crown, MessageCircle, ArrowLeft } from "lucide-react-native";
import { usePremium } from "../lib/premiumStore";
import { useTranslation } from "../lib/useTranslation";

type Props = {
  children: React.ReactNode;
  featureName?: string;
  showBackButton?: boolean;
};

/**
 * Verrou Premium : si l'utilisateur n'est pas premium,
 * affiche un écran de blocage au lieu du contenu.
 */
export function PremiumGate({ children, featureName, showBackButton = true }: Props) {
  const { isPremium, loading } = usePremium();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Text className="text-slate-500">...</Text>
      </View>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Header custom avec bouton retour */}
      {showBackButton && (
        <View
          className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
          style={{ paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16 }}
        >
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, alignSelf: "flex-start" }}
          >
            <ArrowLeft color="#2563eb" size={24} />
            <Text style={{ color: "#2563eb", fontWeight: "600", fontSize: 16 }}>
              {isAr ? "رجوع" : "Retour"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Contenu du blocage */}
      <View className="flex-1 items-center justify-center p-6">
        <View
          className="rounded-full p-6 mb-5"
          style={{ backgroundColor: "#fef3c7" }}
        >
          <Lock color="#b45309" size={48} />
        </View>

        <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center">
          {isAr ? "🔒 ميزة مميزة" : "🔒 Fonctionnalité Premium"}
        </Text>

        {featureName && (
          <Text
            className="text-base font-semibold text-center mt-2"
            style={{ color: "#b45309" }}
          >
            {featureName}
          </Text>
        )}

        <Text className="text-slate-500 dark:text-slate-400 text-center mt-3 leading-6 max-w-xs">
          {isAr
            ? "هذه الميزة متوفرة فقط في النسخة المميزة. اشترك لفتح جميع الميزات."
            : "Cette fonctionnalité est réservée à la version Premium. Abonne-toi pour tout débloquer."}
        </Text>

        <Pressable
          onPress={() => router.push("/premium" as any)}
          style={{
            backgroundColor: "#f59e0b",
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            marginTop: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Crown color="#fff" size={22} />
          <Text className="text-white font-bold text-base">
            {isAr ? "اكتشف النسخة المميزة" : "Découvrir Premium"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/premium" as any)}
          className="mt-3 flex-row items-center gap-2"
        >
          <MessageCircle color="#25d366" size={18} />
          <Text style={{ color: "#25d366" }} className="font-semibold">
            {isAr ? "أو تواصل معنا" : "Ou contacte-nous"}
          </Text>
        </Pressable>

        {/* Bouton retour en bas aussi */}
        {showBackButton && (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            className="mt-8 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700"
          >
            <Text className="text-slate-700 dark:text-slate-200 font-semibold">
              {isAr ? "← رجوع" : "← Retour"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
