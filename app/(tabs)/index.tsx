import { View, Text, ScrollView, Pressable } from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Car, Bell, AlertCircle, Wrench, Shield, ClipboardCheck,
  ChevronRight, CheckCircle2,
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

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const yearCost =
    totalCost(maintenances.filter((m) => m.date >= yearStart)) +
    totalCost(insurances.filter((i) => i.startDate >= yearStart)) +
    totalCost(inspections.filter((i) => i.date >= yearStart));

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900">Bonjour 👋</Text>
            <Text className="text-slate-500 text-sm mt-1">Voici l'état de votre parc</Text>
          </View>
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 100, height: 50 }}
            contentFit="contain"
          />
        </View>

        {/* Stats rapides */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => router.push("/(tabs)/vehicles")}
            className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 active:bg-slate-100"
          >
            <Car color="#2563eb" size={22} />
            <Text className="text-2xl font-bold text-slate-900 mt-2">
              {vehicles.length}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Véhicules</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/reminders")}
            className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 active:bg-slate-100"
          >
            <Bell color="#f59e0b" size={22} />
            <Text className="text-2xl font-bold text-slate-900 mt-2">
              {alerts.length}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Rappels</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/reminders")}
            className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 active:bg-slate-100"
          >
            <AlertCircle color="#ef4444" size={22} />
            <Text className="text-2xl font-bold text-slate-900 mt-2">
              {urgentCount}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Urgents</Text>
          </Pressable>
        </View>

        {/* Coût annuel */}
        <View style={{ backgroundColor: "#2563eb" }} className="rounded-2xl p-4 mb-4">
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
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Échéances à venir
          </Text>
          {alerts.length > 0 && (
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {urgentCount} urgent{urgentCount > 1 ? "s" : ""} • {soonCount} bientôt
            </Text>
          )}
        </View>

        {alerts.length === 0 ? (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 items-center">
            <CheckCircle2 color="#10b981" size={40} />
            <Text className="text-slate-900 dark:text-white font-bold mt-3">Tout est à jour !</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">
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
                className="bg-white rounded-2xl p-3 border border-slate-200 items-center active:bg-slate-100"
              >
                <Text className="text-blue-500 font-semibold text-sm">
                  Voir les {alerts.length - 8} autres alertes
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Derniers véhicules AVEC PHOTO */}
        {vehicles.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mt-6 mb-3">
              <Text className="text-lg font-bold text-slate-900 dark:text-white">Mes véhicules</Text>
              <Pressable onPress={() => router.push("/(tabs)/vehicles")}>
                <Text className="text-blue-500 text-sm font-semibold">Voir tout</Text>
              </Pressable>
            </View>
            <View className="gap-2">
              {vehicles.slice(0, 3).map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => router.push(`/vehicle/${v.id}`)}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex-row items-center overflow-hidden active:bg-slate-100 dark:active:bg-slate-700"
                >
                  {/* Miniature photo */}
                  {v.photoUri ? (
                    <Image
                      source={{ uri: v.photoUri }}
                      style={{ width: 80, height: 80, backgroundColor: "#e2e8f0" }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#dbeafe",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Car color="#2563eb" size={28} />
                    </View>
                  )}

                  {/* Infos */}
                  <View className="flex-1 px-4 py-3">
                    <Text className="font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                      {v.brand} {v.model}
                    </Text>
                    <Text
                      className="text-xs text-slate-500 dark:text-slate-400 mt-1"
                      numberOfLines={1}
                      style={{ writingDirection: "ltr" }}
                    >
                      {v.plate} • {formatMileage(v.mileage)}
                    </Text>
                  </View>

                  <ChevronRight color="#94a3b8" size={20} style={{ marginRight: 12 }} />
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
        <Text className="font-bold text-slate-900 flex-1" numberOfLines={1}>
          {alert.title}
        </Text>
        {alert.severity === "urgent" && (
          <View className="bg-red-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">URGENT</Text>
          </View>
        )}
      </View>
      <Text className="text-slate-600 text-xs mt-1" numberOfLines={1}>
        {alert.vehicleLabel}
      </Text>
      <View className="flex-row items-center gap-2 mt-2">
        <SevIcon color={config.iconColor} size={14} />
        <Text className={`text-sm font-semibold ${config.text}`}>
          {alert.detail}
        </Text>
        {alert.dueDate && (
          <Text className="text-slate-500 text-xs">• {formatDate(alert.dueDate)}</Text>
        )}
      </View>
    </Pressable>
  );
}
