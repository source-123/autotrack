import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Check, DollarSign, Bell, LogOut, User } from "lucide-react-native";
import { router } from "expo-router";
import { useStore } from "../../lib/store";
import { useAuthStore } from "../../lib/authStore";
import { CURRENCIES, formatMoney } from "../../lib/utils";
import { requestPermission } from "../../lib/notifications";
import { logoutUser } from "../../lib/auth";
import { useOnboardingStore } from "../../lib/onboardingStore";
import { useNotificationPrefs } from "../../lib/notificationPrefs";
import { useTranslation } from "../../lib/useTranslation";

export default function ProfileScreen() {
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const user = useAuthStore((s) => s.user);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const { prefs, updatePrefs, toggleDay } = useNotificationPrefs();
  const { t } = useTranslation();
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);

  const testNotif = async () => {
    const ok = await requestPermission();
    if (!ok) {
      Alert.alert("Permission refusée", "Autorise les notifications dans les réglages.");
      return;
    }

    try {
      // Programmer une notification IMMÉDIATE (2 secondes de délai)
      const { default: Notifications } = await import("expo-notifications");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 AutoTrack - Test",
          body: "Les notifications fonctionnent ! Tu recevras des rappels automatiques.",
          sound: "default",
          ...(Platform.OS === "android" ? { channelId: "default" } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          ...(Platform.OS === "android" ? { channelId: "default" } : {}),
        },
      });
      Alert.alert(
        "✅ Test envoyé",
        "Une notification va apparaître dans 2 secondes. Regarde en haut de ton écran !"
      );
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'envoyer la notification");
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logoutUser();
        // Pas besoin de router.replace : useAuth détecte le logout et redirige
      } catch (e: any) {
        console.error("Logout error:", e);
      }
    };

    if (Platform.OS === "web") {
      // Sur web, Alert.alert ne marche pas avec des boutons
      if (window.confirm("Se déconnecter ? Tu devras te reconnecter.")) {
        await doLogout();
      }
    } else {
      Alert.alert("Se déconnecter ?", "Tu devras te reconnecter.", [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", style: "destructive", onPress: doLogout },
      ]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-50">
      <View className="p-4 gap-4">
        {/* Profil utilisateur */}
        <View className="bg-white rounded-2xl p-5 border border-zinc-200">
          <View className="flex-row items-center gap-4">
            <View className="bg-blue-100 rounded-full p-4">
              <User color="#3b82f6" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-zinc-900">
                {user?.displayName || "Utilisateur"}
              </Text>
              <Text className="text-sm text-zinc-500">{user?.email || "-"}</Text>
            </View>
            <Pressable onPress={handleLogout} className="p-2">
              <LogOut color="#ef4444" size={22} />
            </Pressable>
          </View>
        </View>

        {/* Notifications */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <View className="flex-row items-center gap-2 mb-3">
            <Bell color="#f59e0b" size={20} />
            <Text className="text-slate-900 dark:text-white font-bold">{t("notifications")}</Text>
          </View>

          <ToggleRow
            label="Activer les notifications"
            value={prefs.enabled}
            onToggle={() => updatePrefs({ enabled: !prefs.enabled })}
          />

          {prefs.enabled && (
            <>
              <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mt-4 mb-2">
                Me rappeler avant l'échéance
              </Text>
              <ToggleRow label={t("days30")} value={prefs.daysBefore.d30} onToggle={() => toggleDay("d30")} />
              <ToggleRow label={t("days7")} value={prefs.daysBefore.d7} onToggle={() => toggleDay("d7")} />
              <ToggleRow label={t("days1")} value={prefs.daysBefore.d1} onToggle={() => toggleDay("d1")} />
              <ToggleRow
                label={t("mileageReminders")}
                value={prefs.mileageReminders}
                onToggle={() => updatePrefs({ mileageReminders: !prefs.mileageReminders })}
              />
            </>
          )}

          <Pressable onPress={testNotif} className="bg-amber-500 rounded-xl py-3 active:bg-amber-600 mt-4">
            <Text className="text-white text-center font-bold">{t("testNotifications")}</Text>
          </Pressable>
        </View>

        {/* Statistiques */}
        <View className="bg-white rounded-2xl p-4 border border-zinc-200">
          <Text className="text-zinc-900 font-bold mb-3">{t("database")}</Text>
          <StatRow label={t("vehicles")} value={vehicles.length} />
          <StatRow label={t("maintenanceLabel")} value={maintenances.length} />
          <StatRow label={t("insurancesLabel")} value={insurances.length} />
          <StatRow label={t("inspectionsLabel")} value={inspections.length} />
        </View>

        {/* Aide & Guide */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-xl">💡</Text>
            <Text className="text-slate-900 dark:text-white font-bold">{t("helpGuide")}</Text>
          </View>

          <Pressable
            onPress={() => {
              resetOnboarding();
              router.push("/onboarding");
            }}
            className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700"
          >
            <Text className="text-slate-700 dark:text-slate-300">{t("reviewGuide")}</Text>
            <Text className="text-blue-600 dark:text-blue-400">→</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/onboarding/calculations")}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-slate-700 dark:text-slate-300">{t("understandStats")}</Text>
            <Text className="text-blue-600 dark:text-blue-400">→</Text>
          </Pressable>
        </View>

        {/* Langue */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-xl">🌍</Text>
            <Text className="text-slate-900 dark:text-white font-bold">{t("language")}</Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setLanguage("fr")}
              className={`flex-1 py-3 rounded-xl border ${
                language === "fr"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  language === "fr" ? "text-white" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                🇫🇷 Français
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLanguage("ar")}
              className={`flex-1 py-3 rounded-xl border ${
                language === "ar"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  language === "ar" ? "text-white" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                🇹🇳 العربية
              </Text>
            </Pressable>
          </View>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {t("languageNote")}
          </Text>
        </View>

        {/* Devise */}
        <View className="bg-white rounded-2xl p-4 border border-zinc-200">
          <View className="flex-row items-center gap-2 mb-3">
            <DollarSign color="#3b82f6" size={20} />
            <Text className="text-slate-900 dark:text-white font-bold">{t("currency")}</Text>
          </View>
          {CURRENCIES.map((c) => {
            const active = currency === c.code;
            return (
              <Pressable key={c.code} onPress={() => setCurrency(c.code)}
                className={`flex-row items-center justify-between py-3 px-3 rounded-xl mb-1 ${active ? "bg-blue-50" : "active:bg-zinc-50"}`}>
                <View className="flex-row items-center gap-3">
                  <View className="bg-zinc-100 rounded-lg w-10 h-10 items-center justify-center">
                    <Text className="font-bold text-zinc-700 text-sm">{c.symbol}</Text>
                  </View>
                  <View>
                    <Text className="text-zinc-900 font-semibold">{c.code}</Text>
                    <Text className="text-zinc-500 text-xs">{c.label}</Text>
                  </View>
                </View>
                {active && <Check color="#3b82f6" size={20} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
    >
      <Text className="text-slate-700 dark:text-slate-300 text-sm flex-1">{label}</Text>
      <View
        className={`w-12 h-7 rounded-full ${
          value ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
        } justify-center px-0.5`}
      >
        <View
          className={`w-6 h-6 rounded-full bg-white ${value ? "self-end" : "self-start"}`}
        />
      </View>
    </Pressable>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-zinc-100 last:border-0">
      <Text className="text-zinc-500 text-sm">{label}</Text>
      <Text className="text-zinc-900 font-bold text-sm">{value}</Text>
    </View>
  );
}
