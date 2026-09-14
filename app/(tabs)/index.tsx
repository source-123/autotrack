import { View, Text, ScrollView, Pressable } from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import {
  Car, Bell, AlertCircle, Wrench, Shield, ClipboardCheck,
  Link2, ChevronRight, CheckCircle2,
} from "lucide-react-native";
import { useStore } from "../../lib/store";
import { computeAlerts } from "../../lib/alerts";
import { formatDate, formatMoney, formatMileage, totalCost } from "../../lib/utils";

export default function HomeScreen() {
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const reminders = useStore((s) => s.reminders);
  const currency = useStore((s) => s.currency);

  const alerts = useMemo(
    () => computeAlerts(vehicles, maintenances, insurances, inspections, reminders),
    [vehicles, maintenances, insurances, inspections, reminders]
  );

  const urgentCount = alerts.filter((a) => a.severity === "urgent").length;
  const soonCount = alerts.filter((a) => a.severity === "soon").length;

  // Coût total annuel
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const yearCost =
    totalCost(maintenances.filter((m) => m.date >= yearStart)) +
    totalCost(insurances.filter((i) => i.startDate >= yearStart)) +
    totalCost(inspections.filter((i) => i.date >= yearStart));

  return (
    <ScrollView className="flex-1 bg-zinc-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-zinc-900 mb-1">Bonjour 👋</Text>
        <Text className="text-zinc-500 mb-6">Voici l'état de votre parc</Text>

        {/* Stats rapides */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => router.push("/(tabs)/vehicles")}
            className="flex-1 bg-white rounded-2xl p-4 border border-zinc-200 active:bg-zinc-100"
          >
            <Car color="#3b82f6" size={22} />
            <Text className="text-2xl font-bold text-zinc-900 mt-2">
              {vehicles.length}
            </Text>
            <Text className="text-xs text-zinc-500">Véhicules</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/reminders")}
            className="flex-1 bg-white rounded-2xl p-4 border border-zinc-200 active:bg-zinc-100"
          >
            <Bell color="#f59e0b" size={22} />
            <Text className="text-2xl font-bold text-zinc-900 mt-2">
              {alerts.length}
            </Text>
            <Text className="text-xs text-zinc-500">Rappels</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/reminders")}
            className="flex-1 bg-white rounded-2xl p-4 border border-zinc-200 active:bg-zinc-100"
          >
            <AlertCircle color="#ef4444" size={22} />
            <Text className="text-2xl font-bold text-zinc-900 mt-2">
              {urgentCount}
            </Text>
            <Text className="text-xs text-zinc-500">Urgents</Text>
          </Pressable>
        </View>

        {/* Coût annuel */}
        <View className="bg-blue-500 rounded-2xl p-4 mb-4">
          <Text className="text-blue-100 text-xs uppercase font-semibold">
            Coût total {new Date().getFullYear()}
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {formatMoney(yearCost, currency)}
          </Text>
          <Text className="text-blue-100 text-xs mt-1">
            Entretiens + assurances + visites
          </Text>
        </View>

        {/* Alertes */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-zinc-900">
            Échéances à venir
          </Text>
          {alerts.length > 0 && (
            <Text className="text-xs text-zinc-500">
              {urgentCount} urgent{urgentCount > 1 ? "s" : ""} • {soonCount} bientôt
            </Text>
          )}
        </View>

        {alerts.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 border border-zinc-200 items-center">
            <CheckCircle2 color="#10b981" size={40} />
            <Text className="text-zinc-900 font-bold mt-3">Tout est à jour !</Text>
            <Text className="text-zinc-500 text-sm text-center mt-1">
              Aucune échéance dans les prochains jours
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {alerts.slice(0, 8).map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
            {alerts.length > 8 && (
              <Pressable
                onPress={() => router.push("/(tabs)/reminders")}
                className="bg-white rounded-2xl p-3 border border-zinc-200 items-center active:bg-zinc-100"
              >
                <Text className="text-blue-500 font-semibold text-sm">
                  Voir les {alerts.length - 8} autres alertes
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Derniers véhicules */}
        {vehicles.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mt-6 mb-3">
              <Text className="text-lg font-bold text-zinc-900">Mes véhicules</Text>
              <Pressable onPress={() => router.push("/(tabs)/vehicles")}>
                <Text className="text-blue-500 text-sm font-semibold">Voir tout</Text>
              </Pressable>
            </View>
            <View className="gap-2">
              {vehicles.slice(0, 3).map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => router.push(`/vehicle/${v.id}`)}
                  className="bg-white rounded-2xl p-4 border border-zinc-200 flex-row items-center active:bg-zinc-100"
                >
                  <View className="flex-1">
                    <Text className="font-bold text-zinc-900">
                      {v.brand} {v.model}
                    </Text>
                    <Text className="text-xs text-zinc-500 mt-1">
                      {v.plate} • {formatMileage(v.mileage)}
                    </Text>
                  </View>
                  <ChevronRight color="#a1a1aa" size={20} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function AlertCard({ alert }: { alert: any }) {
  const config = {
    urgent: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: AlertCircle,
      iconColor: "#ef4444",
    },
    soon: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: Bell,
      iconColor: "#f59e0b",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: Bell,
      iconColor: "#3b82f6",
    },
  }[alert.severity as "urgent" | "soon" | "info"];

  const typeIcon = {
    inspection: ClipboardCheck,
    insurance: Shield,
    maintenance: Wrench,
    reminder: Bell,
  }[alert.type as "inspection" | "insurance" | "maintenance" | "reminder"] ?? Bell;

  const TypeIcon = typeIcon;
  const SevIcon = config.icon;

  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${alert.vehicleId}`)}
      className={`${config.bg} rounded-2xl p-4 border ${config.border} active:opacity-80`}
    >
      <View className="flex-row items-center gap-2">
        <TypeIcon color={config.iconColor} size={18} />
        <Text className="font-bold text-zinc-900 flex-1" numberOfLines={1}>
          {alert.title}
        </Text>
        {alert.severity === "urgent" && (
          <View className="bg-red-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">URGENT</Text>
          </View>
        )}
      </View>
      <Text className="text-zinc-600 text-xs mt-1" numberOfLines={1}>
        {alert.vehicleLabel}
      </Text>
      <View className="flex-row items-center gap-2 mt-2">
        <SevIcon color={config.iconColor} size={14} />
        <Text className={`text-sm font-semibold ${config.text}`}>
          {alert.detail}
        </Text>
        {alert.dueDate && (
          <Text className="text-zinc-500 text-xs">• {formatDate(alert.dueDate)}</Text>
        )}
      </View>
    </Pressable>
  );
}
