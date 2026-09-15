import { View, Text, ScrollView, Pressable } from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Car, Bell, AlertCircle, Wrench, Shield, ClipboardCheck,
  ChevronRight, CheckCircle2, Fuel, Activity,
} from "lucide-react-native";
import { useStore } from "../../lib/store";
import { computeAlerts } from "../../lib/alerts";
import { computeTrackingScore } from "../../lib/trackingScore";
import { formatDate, formatMoney, formatMileage, totalCost } from "../../lib/utils";
import { useTranslation } from "../../lib/useTranslation";

export default function HomeScreen() {
  const { t } = useTranslation();
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const reminders = useStore((s) => s.reminders);
  const fuels = useStore((s) => s.fuels);
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
    totalCost(inspections.filter((i) => i.date >= yearStart)) +
    fuels.filter((f) => f.date >= yearStart).reduce((s, f) => s + f.totalCost, 0);

  const parcScore = useMemo(() => {
    if (vehicles.length === 0) return null;
    const scores = vehicles.map((v) => computeTrackingScore(v, maintenances, insurances, inspections, fuels).score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    let label = t("critical"); let color = "#ef4444";
    if (avg >= 90) { label = t("excellent"); color = "#10b981"; }
    else if (avg >= 70) { label = t("good"); color = "#3b82f6"; }
    else if (avg >= 50) { label = t("average"); color = "#f59e0b"; }
    return { score: Math.round(avg), label, color };
  }, [vehicles, maintenances, insurances, inspections, fuels, t]);

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">{t("hello")}</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("yourParcState")}</Text>
          </View>
          <Image source={require("../../assets/logo.png")} style={{ width: 100, height: 50 }} contentFit="contain" />
        </View>

        <View className="flex-row gap-3 mb-4">
          <Pressable onPress={() => router.push("/(tabs)/vehicles")} className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <Car color="#2563eb" size={22} />
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{vehicles.length}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">{t("vehicles")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/reminders")} className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <Bell color="#f59e0b" size={22} />
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{alerts.length}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">{t("reminders")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/reminders")} className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <AlertCircle color="#ef4444" size={22} />
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{urgentCount}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">{t("urgent")}</Text>
          </Pressable>
        </View>

        {parcScore && (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-4 flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: parcScore.color + "20" }}>
              <Text className="text-xl font-bold" style={{ color: parcScore.color }}>{parcScore.score}%</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Activity color={parcScore.color} size={16} />
                <Text className="text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">{t("parcState")}</Text>
              </View>
              <Text className="text-lg font-bold mt-1" style={{ color: parcScore.color }}>{parcScore.label}</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">{t("trackingScore")}</Text>
            </View>
          </View>
        )}

        <View style={{ backgroundColor: "#2563eb" }} className="rounded-2xl p-4 mb-4">
          <Text className="text-blue-100 text-xs uppercase font-semibold">{t("totalCost")} {new Date().getFullYear()}</Text>
          <Text className="text-white text-3xl font-bold mt-1">{formatMoney(yearCost, currency)}</Text>
          <Text className="text-blue-100 text-xs mt-1">{t("entretiensInsurancesVisits")}</Text>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">{t("upcomingDeadlines")}</Text>
          {alerts.length > 0 && (
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {urgentCount} {t("urgent").toLowerCase()} • {soonCount} {t("soon").toLowerCase()}
            </Text>
          )}
        </View>

        {alerts.length === 0 ? (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 items-center">
            <CheckCircle2 color="#10b981" size={40} />
            <Text className="text-slate-900 dark:text-white font-bold mt-3">{t("allUpToDate")}</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">{t("noDeadlineSoon")}</Text>
          </View>
        ) : (
          <View className="gap-2">
            {alerts.slice(0, 5).map((a) => <AlertCard key={a.id} alert={a} />)}
            {alerts.length > 5 && (
              <Pressable onPress={() => router.push("/(tabs)/reminders")} className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 items-center">
                <Text className="text-blue-500 font-semibold text-sm">{t("viewMoreAlerts", { n: alerts.length - 5 })}</Text>
              </Pressable>
            )}
          </View>
        )}

        {vehicles.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mt-6 mb-3">
              <Text className="text-lg font-bold text-slate-900 dark:text-white">{t("myVehicles")}</Text>
              <Pressable onPress={() => router.push("/(tabs)/vehicles")}>
                <Text className="text-blue-500 text-sm font-semibold">{t("viewAll")}</Text>
              </Pressable>
            </View>
            <View className="gap-3">
              {vehicles.slice(0, 3).map((v) => (
                <VehicleCardWithActions
                  key={v.id}
                  vehicle={v}
                  score={computeTrackingScore(v, maintenances, insurances, inspections, fuels)}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function VehicleCardWithActions({ vehicle, score }: { vehicle: any; score: any }) {
  const { t } = useTranslation();
  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Pressable onPress={() => router.push(`/vehicle/${vehicle.id}`)} className="flex-row items-center active:bg-slate-50 dark:active:bg-slate-700">
        {vehicle.photoUri ? (
          <Image source={{ uri: vehicle.photoUri }} style={{ width: 80, height: 80, backgroundColor: "#e2e8f0" }} contentFit="cover" transition={200} />
        ) : (
          <View style={{ width: 80, height: 80, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" }}>
            <Car color="#2563eb" size={28} />
          </View>
        )}
        <View className="flex-1 px-4 py-3">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-slate-900 dark:text-white flex-1" numberOfLines={1}>{vehicle.brand} {vehicle.model}</Text>
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: score.color + "20" }}>
              <Text className="text-xs font-bold" style={{ color: score.color }}>{score.score}%</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1" numberOfLines={1} style={{ writingDirection: "ltr" }}>
            {vehicle.plate} • {formatMileage(vehicle.mileage)}
          </Text>
        </View>
        <ChevronRight color="#94a3b8" size={20} style={{ marginRight: 12 }} />
      </Pressable>

      <View className="flex-row border-t border-slate-100 dark:border-slate-700">
        <QuickAction icon={<Wrench color="#8b5cf6" size={16} />} label={t("tabMaintenance")} onPress={() => router.push(`/maintenance/new?vehicleId=${vehicle.id}`)} />
        <QuickAction icon={<Shield color="#3b82f6" size={16} />} label={t("tabInsurance")} onPress={() => router.push(`/insurance/new?vehicleId=${vehicle.id}`)} />
        <QuickAction icon={<Fuel color="#f59e0b" size={16} />} label={t("tabFuel")} onPress={() => router.push(`/fuel/new?vehicleId=${vehicle.id}`)} />
        <QuickAction icon={<ClipboardCheck color="#10b981" size={16} />} label={t("tabInspection")} onPress={() => router.push(`/inspection/new?vehicleId=${vehicle.id}`)} />
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 py-3 items-center active:bg-slate-50 dark:active:bg-slate-700 border-r border-slate-100 dark:border-slate-700 last:border-r-0">
      {icon}
      <Text className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{label}</Text>
    </Pressable>
  );
}

function AlertCard({ alert }: { alert: any }) {
  const { t } = useTranslation();
  const config = {
    urgent: { bg: "bg-red-50 dark:bg-red-950", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-300", icon: AlertCircle, iconColor: "#ef4444" },
    soon: { bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", icon: Bell, iconColor: "#f59e0b" },
    info: { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", icon: Bell, iconColor: "#3b82f6" },
  }[alert.severity as "urgent" | "soon" | "info"];

  const typeIcon = { inspection: ClipboardCheck, insurance: Shield, maintenance: Wrench, reminder: Bell }[alert.type as "inspection" | "insurance" | "maintenance" | "reminder"] ?? Bell;
  const TypeIcon = typeIcon;
  const SevIcon = config.icon;

  return (
    <Pressable onPress={() => router.push(`/vehicle/${alert.vehicleId}`)} className={`${config.bg} rounded-2xl p-4 border ${config.border} active:opacity-80`}>
      <View className="flex-row items-center gap-2">
        <TypeIcon color={config.iconColor} size={18} />
        <Text className="font-bold text-slate-900 dark:text-white flex-1" numberOfLines={1}>{alert.title}</Text>
        {alert.severity === "urgent" && (
          <View className="bg-red-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">{t("urgentUppercase")}</Text>
          </View>
        )}
      </View>
      <Text className="text-slate-600 dark:text-slate-400 text-xs mt-1" numberOfLines={1}>{alert.vehicleLabel}</Text>
      <View className="flex-row items-center gap-2 mt-2">
        <SevIcon color={config.iconColor} size={14} />
        <Text className={`text-sm font-semibold ${config.text}`}>{alert.detail}</Text>
        {alert.dueDate && <Text className="text-slate-500 dark:text-slate-400 text-xs">• {formatDate(alert.dueDate)}</Text>}
      </View>
    </Pressable>
  );
}
