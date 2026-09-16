import { View, Text, ScrollView, Pressable, Linking, Alert, Platform } from "react-native";
import { Stack, router } from "expo-router";
import {
  Crown, Check, X, MessageCircle, Sparkles, FileText,
  Bell, Infinity as InfinityIcon, Star, TrendingUp, Shield, ArrowLeft,
} from "lucide-react-native";
import { useTranslation } from "../../lib/useTranslation";
import { useAuthStore } from "../../lib/authStore";
import { PREMIUM_CONFIG, buildWhatsAppUrl } from "../../lib/premiumConfig";

type Feature = {
  key: string;
  labelFr: string;
  labelAr: string;
  free: boolean;
  premium: boolean;
  icon: any;
};

const FEATURES: Feature[] = [
  { key: "vehicles1", labelFr: "1 véhicule", labelAr: "سيارة واحدة", free: true, premium: true, icon: InfinityIcon },
  { key: "vehiclesMulti", labelFr: "Véhicules illimités", labelAr: "سيارات غير محدودة", free: false, premium: true, icon: InfinityIcon },
  { key: "maintenance", labelFr: "Suivi entretien complet", labelAr: "متابعة الصيانة", free: true, premium: true, icon: TrendingUp },
  { key: "notifications", labelFr: "Notifications automatiques", labelAr: "إشعارات تلقائية", free: true, premium: true, icon: Bell },
  { key: "stats", labelFr: "Statistiques de base", labelAr: "إحصائيات أساسية", free: true, premium: true, icon: TrendingUp },
  { key: "fuel", labelFr: "Suivi carburant", labelAr: "متابعة الوقود", free: true, premium: true, icon: TrendingUp },
  { key: "documents", labelFr: "Documents (PDF/Photos)", labelAr: "المستندات", free: false, premium: true, icon: FileText },
  { key: "export", labelFr: "Export PDF du carnet", labelAr: "تصدير PDF", free: false, premium: true, icon: FileText },
  { key: "ai", labelFr: "Assistant IA (Gemini)", labelAr: "المساعد الذكي", free: false, premium: true, icon: Sparkles },
  { key: "analysis", labelFr: "Analyse prédictive IA", labelAr: "تحليل ذكي", free: false, premium: true, icon: Sparkles },
  { key: "history", labelFr: "Historique illimité", labelAr: "سجل غير محدود", free: false, premium: true, icon: TrendingUp },
  { key: "support", labelFr: "Support prioritaire", labelAr: "دعم أولوي", free: false, premium: true, icon: Shield },
];

export default function PremiumScreen() {
  const { t, lang } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const openWhatsApp = (plan: "monthly" | "yearly" | "lifetime" | "info") => {
    const url = buildWhatsAppUrl(user?.email || "non renseigné", plan, lang as "fr" | "ar");
    Linking.openURL(url).catch(() => {
      Alert.alert("WhatsApp", "Impossible d'ouvrir WhatsApp. Vérifie qu'il est installé.");
    });
  };

  const isAr = lang === "ar";

  return (
    <>
      <Stack.Screen
        options={{
          title: isAr ? "النسخة المميزة" : "Car Autotrack Premium",
          headerShown: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/(tabs)")}
              style={{ paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <ArrowLeft color="#2563eb" size={24} />
            </Pressable>
          ),
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          {/* Header doré */}
          <View
            style={{
              backgroundColor: PREMIUM_CONFIG.colors.gold,
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
            }}
          >
            <View style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 999, padding: 16, marginBottom: 12 }}>
              <Crown color="#fff" size={48} />
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              {isAr ? "النسخة المميزة" : "Version Premium"}
            </Text>
            <Text className="text-white/90 text-sm text-center mt-2 leading-5">
              {isAr
                ? "افتح كل الميزات وسيطر على سيارتك بالكامل"
                : "Débloquez toutes les fonctionnalités et maîtrisez votre véhicule"}
            </Text>
          </View>

          {/* Comparaison features */}
          <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header du tableau */}
            <View className="flex-row border-b border-slate-200 dark:border-slate-700">
              <View className="flex-1 p-3">
                <Text className="font-bold text-slate-900 dark:text-white text-sm">
                  {isAr ? "الميزة" : "Fonctionnalité"}
                </Text>
              </View>
              <View className="w-20 p-3 items-center">
                <Text className="font-bold text-slate-500 text-xs">
                  {isAr ? "مجاني" : "Gratuit"}
                </Text>
              </View>
              <View className="w-20 p-3 items-center bg-amber-50 dark:bg-amber-950">
                <Text style={{ color: PREMIUM_CONFIG.colors.goldDark }} className="font-bold text-xs">
                  Premium
                </Text>
              </View>
            </View>

            {/* Lignes */}
            {FEATURES.map((f, i) => (
              <View
                key={f.key}
                className={`flex-row border-b border-slate-100 dark:border-slate-700 ${
                  i === FEATURES.length - 1 ? "border-b-0" : ""
                }`}
              >
                <View className="flex-1 p-3 flex-row items-center gap-2">
                  <f.icon color="#64748b" size={16} />
                  <Text className="text-slate-700 dark:text-slate-300 text-sm flex-1">
                    {isAr ? f.labelAr : f.labelFr}
                  </Text>
                </View>
                <View className="w-20 p-3 items-center justify-center">
                  {f.free ? (
                    <Check color="#10b981" size={20} />
                  ) : (
                    <X color="#ef4444" size={20} />
                  )}
                </View>
                <View className="w-20 p-3 items-center justify-center bg-amber-50 dark:bg-amber-950">
                  {f.premium ? (
                    <Check color={PREMIUM_CONFIG.colors.gold} size={20} />
                  ) : (
                    <X color="#ef4444" size={20} />
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Cartes de prix */}
          <Text className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {isAr ? "اختر خطتك" : "Choisis ta formule"}
          </Text>

          {/* Mensuel */}
          <PlanCard
            title={isAr ? "شهري" : "Mensuel"}
            price={`${PREMIUM_CONFIG.prices.monthly} DT`}
            period={isAr ? "/ شهر" : "/ mois"}
            highlight={false}
            onPress={() => openWhatsApp("monthly")}
            isAr={isAr}
          />

          {/* Annuel - mis en avant */}
          <PlanCard
            title={isAr ? "سنوي" : "Annuel"}
            price={`${PREMIUM_CONFIG.prices.yearly} DT`}
            period={isAr ? "/ سنة" : "/ an"}
            highlight={true}
            badge={isAr ? "الأكثر شعبية" : "Le plus populaire"}
            savings={isAr ? "وفّر 45%" : "Économise 45%"}
            onPress={() => openWhatsApp("yearly")}
            isAr={isAr}
          />

          {/* À vie */}
          <PlanCard
            title={isAr ? "مدى الحياة" : "À vie"}
            price={`${PREMIUM_CONFIG.prices.lifetime} DT`}
            period={isAr ? "دفعة واحدة" : "paiement unique"}
            highlight={false}
            onPress={() => openWhatsApp("lifetime")}
            isAr={isAr}
          />

          {/* Bouton WhatsApp principal */}
          <Pressable
            onPress={() => openWhatsApp("info")}
            style={{ backgroundColor: "#25d366", borderRadius: 16, padding: 16, marginTop: 8 }}
            className="flex-row items-center justify-center gap-3 active:opacity-90"
          >
            <MessageCircle color="#fff" size={24} />
            <Text className="text-white font-bold text-base">
              {isAr ? "تواصل عبر واتساب" : "Contacter via WhatsApp"}
            </Text>
          </Pressable>

          {/* Info */}
          <View className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
            <Text className="text-slate-500 dark:text-slate-400 text-xs text-center leading-5">
              {isAr
                ? "💳 طرق الدفع المتوفرة: D17، Flouci، تحويل بنكي، نقداً"
                : "💳 Modes de paiement : D17, Flouci, virement bancaire, espèces"}
              {"\n\n"}
              {isAr
                ? "سيتم تفعيل حسابك خلال 24 ساعة بعد الدفع"
                : "Ton compte sera activé sous 24h après paiement"}
            </Text>
          </View>

          <View className="h-4" />

          {/* Bouton retour */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="bg-slate-200 dark:bg-slate-700 rounded-xl py-4 active:bg-slate-300"
          >
            <Text className="text-slate-700 dark:text-slate-200 text-center font-bold">
              {isAr ? "العودة للرئيسية" : "Retour à l'accueil"}
            </Text>
          </Pressable>

          <View className="h-4" />
        </View>
      </ScrollView>
    </>
  );
}

function PlanCard({
  title, price, period, highlight, badge, savings, onPress, isAr,
}: {
  title: string;
  price: string;
  period: string;
  highlight: boolean;
  badge?: string;
  savings?: string;
  onPress: () => void;
  isAr: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl p-5 border-2 ${
        highlight
          ? "border-amber-400 bg-amber-50 dark:bg-amber-950"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      } active:opacity-90`}
    >
      {badge && (
        <View
          style={{ backgroundColor: PREMIUM_CONFIG.colors.gold }}
          className="self-start rounded-full px-3 py-1 mb-3"
        >
          <Text className="text-white text-xs font-bold">
            {isAr ? "⭐ " : "⭐ "}{badge}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-slate-900 dark:text-white font-bold text-lg">
            {title}
          </Text>
          {savings && (
            <Text style={{ color: PREMIUM_CONFIG.colors.goldDark }} className="text-xs font-semibold mt-1">
              {savings}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text
            style={{ color: highlight ? PREMIUM_CONFIG.colors.goldDark : "#0f172a" }}
            className="text-2xl font-bold"
          >
            {price}
          </Text>
          <Text className="text-slate-500 text-xs">{period}</Text>
        </View>
      </View>
    </Pressable>
  );
}
