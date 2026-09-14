import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Check, DollarSign, Bell, LogOut, User } from "lucide-react-native";
import { router } from "expo-router";
import { useStore } from "../../lib/store";
import { useAuthStore } from "../../lib/authStore";
import { CURRENCIES, formatMoney } from "../../lib/utils";
import { requestPermission } from "../../lib/notifications";
import { logoutUser } from "../../lib/auth";

export default function ProfileScreen() {
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const user = useAuthStore((s) => s.user);

  const testNotif = async () => {
    const ok = await requestPermission();
    if (!ok) {
      Alert.alert("Permission refusée", "Autorise les notifications dans les réglages.");
      return;
    }
    Alert.alert("✅ Notifications activées", "Les rappels seront programmés automatiquement.");
  };

  const handleLogout = () => {
    Alert.alert("Se déconnecter ?", "Tu devras te reconnecter.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          router.replace("/(auth)/login");
        },
      },
    ]);
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
        <View className="bg-white rounded-2xl p-4 border border-zinc-200">
          <View className="flex-row items-center gap-2 mb-3">
            <Bell color="#f59e0b" size={20} />
            <Text className="text-zinc-900 font-bold">Notifications</Text>
          </View>
          <Text className="text-zinc-500 text-sm mb-3">
            Rappels automatiques 30, 7 et 1 jour avant chaque échéance.
          </Text>
          <Pressable onPress={testNotif} className="bg-amber-500 rounded-xl py-3 active:bg-amber-600">
            <Text className="text-white text-center font-bold">Activer les notifications</Text>
          </Pressable>
        </View>

        {/* Statistiques */}
        <View className="bg-white rounded-2xl p-4 border border-zinc-200">
          <Text className="text-zinc-900 font-bold mb-3">Ma base de données</Text>
          <StatRow label="Véhicules" value={vehicles.length} />
          <StatRow label="Entretiens" value={maintenances.length} />
          <StatRow label="Assurances" value={insurances.length} />
          <StatRow label="Visites techniques" value={inspections.length} />
        </View>

        {/* Devise */}
        <View className="bg-white rounded-2xl p-4 border border-zinc-200">
          <View className="flex-row items-center gap-2 mb-3">
            <DollarSign color="#3b82f6" size={20} />
            <Text className="text-zinc-900 font-bold">Devise</Text>
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

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-zinc-100 last:border-0">
      <Text className="text-zinc-500 text-sm">{label}</Text>
      <Text className="text-zinc-900 font-bold text-sm">{value}</Text>
    </View>
  );
}
