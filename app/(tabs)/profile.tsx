import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { User, LogOut, Crown, HelpCircle, ChevronRight } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { useAuthStore } from "../../lib/authStore";
import { useTranslation } from "../../lib/useTranslation";
import { logoutUser } from "../../lib/auth";

export default function ProfileScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";
  const user = useAuthStore((s) => s.user);

  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logoutUser();
      } catch (e: any) {
        console.error("Logout error:", e);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(t("logoutConfirm") + "\n\n" + t("logoutMessage"))) {
        await doLogout();
      }
    } else {
      Alert.alert(t("logoutConfirm"), t("logoutMessage"), [
        { text: t("cancel"), style: "cancel" },
        { text: t("logoutButton"), style: "destructive", onPress: doLogout },
      ]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-4 gap-4">
        {/* User card */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <View className="flex-row items-center gap-4">
            <View className="bg-blue-100 dark:bg-blue-950 rounded-full p-4">
              <User color="#2563eb" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.displayName || (isAr ? "مستخدم" : "Utilisateur")}
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">{user?.email || "-"}</Text>
            </View>
            <Pressable onPress={handleLogout} className="p-2">
              <LogOut color="#ef4444" size={22} />
            </Pressable>
          </View>
        </View>

        {/* Premium */}
        <Pressable
          onPress={() => router.push("/premium" as any)}
          className="rounded-2xl p-4 active:opacity-90 flex-row items-center gap-3"
          style={{ backgroundColor: "#f59e0b" }}
        >
          <Crown color="#fff" size={26} />
          <View className="flex-1">
            <Text className="text-white font-bold text-base">
              {isAr ? "النسخة المميزة" : "Version Premium"}
            </Text>
            <Text className="text-white/90 text-xs mt-0.5">
              {isAr ? "افتح كل الميزات" : "Débloquer toutes les fonctionnalités"}
            </Text>
          </View>
          <ChevronRight color="#fff" size={22} />
        </Pressable>

        {/* Stats */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <Text className="text-slate-900 dark:text-white font-bold mb-3">
            {isAr ? "قاعدة بياناتي" : "Ma base de données"}
          </Text>
          <StatRow label={isAr ? "سيارات" : "Véhicules"} value={vehicles.length} />
          <StatRow label={isAr ? "صيانة" : "Entretiens"} value={maintenances.length} />
          <StatRow label={isAr ? "تأمين" : "Assurances"} value={insurances.length} />
          <StatRow label={isAr ? "فحص فني" : "Visites"} value={inspections.length} />
        </View>

        {/* Aide */}
        <Pressable
          onPress={() => router.push("/help" as any)}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-700"
        >
          <HelpCircle color="#3b82f6" size={22} />
          <Text className="flex-1 text-slate-900 dark:text-white font-semibold">
            {isAr ? "المساعدة والدليل" : "Aide & guide"}
          </Text>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>

        {/* Version */}
        <Text className="text-xs text-slate-400 text-center mt-4 mb-6">
          Car Autotrack v1.3.0
        </Text>
      </View>
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <Text className="text-slate-500 dark:text-slate-400 text-sm">{label}</Text>
      <Text className="text-slate-900 dark:text-white font-bold text-sm">{value}</Text>
    </View>
  );
}
