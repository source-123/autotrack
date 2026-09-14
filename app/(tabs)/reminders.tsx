import { View, Text, ScrollView, Pressable } from "react-native";
import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  Bell, AlertCircle, Wrench, Shield, ClipboardCheck, CheckCircle2,
} from "lucide-react-native";
import { useStore } from "../../lib/store";
import { computeAlerts, Alert } from "../../lib/alerts";
import { formatDate, formatMileage } from "../../lib/utils";

type Filter = "all" | "urgent" | "soon";

export default function RemindersScreen() {
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const reminders = useStore((s) => s.reminders);

  const [filter, setFilter] = useState<Filter>("all");

  const alerts = useMemo(
    () => computeAlerts(vehicles, maintenances, insurances, inspections, reminders),
    [vehicles, maintenances, insurances, inspections, reminders]
  );

  const filtered = alerts.filter((a) =>
    filter === "all" ? true : a.severity === filter
  );

  const urgentCount = alerts.filter((a) => a.severity === "urgent").length;
  const soonCount = alerts.filter((a) => a.severity === "soon").length;

  return (
    <ScrollView className="flex-1 bg-zinc-50">
      <View className="p-4">
        {/* Filtres */}
        <View className="flex-row gap-2 mb-4">
          <FilterChip
            active={filter === "all"}
            onPress={() => setFilter("all")}
            label={`Tous (${alerts.length})`}
          />
          <FilterChip
            active={filter === "urgent"}
            onPress={() => setFilter("urgent")}
            label={`Urgents (${urgentCount})`}
            color="red"
          />
          <FilterChip
            active={filter === "soon"}
            onPress={() => setFilter("soon")}
            label={`Bientôt (${soonCount})`}
            color="amber"
          />
        </View>

        {filtered.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 border border-zinc-200 items-center mt-4">
            <CheckCircle2 color="#10b981" size={48} />
            <Text className="text-zinc-900 font-bold mt-3 text-lg">
              {filter === "all" ? "Aucun rappel" : "Aucun rappel dans cette catégorie"}
            </Text>
            <Text className="text-zinc-500 text-sm text-center mt-1">
              Ajoutez des entretiens, assurances ou visites pour voir apparaître les échéances
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {filtered.map((a) => (
              <BigAlertCard key={a.id} alert={a} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function FilterChip({
  active, onPress, label, color = "blue",
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  color?: "blue" | "red" | "amber";
}) {
  const activeBg = {
    blue: "bg-blue-500 border-blue-500",
    red: "bg-red-500 border-red-500",
    amber: "bg-amber-500 border-amber-500",
  }[color];

  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-full border ${
        active ? activeBg : "bg-white border-zinc-200"
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          active ? "text-white" : "text-zinc-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BigAlertCard({ alert }: { alert: Alert }) {
  const config = {
    urgent: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      iconColor: "#ef4444",
    },
    soon: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      iconColor: "#f59e0b",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
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

  const typeLabel = {
    inspection: "Visite technique",
    insurance: "Assurance",
    maintenance: "Entretien",
    reminder: "Rappel",
  }[alert.type as "inspection" | "insurance" | "maintenance" | "reminder"];

  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${alert.vehicleId}`)}
      className={`${config.bg} rounded-2xl p-4 border ${config.border} active:opacity-80`}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <TypeIcon color={config.iconColor} size={20} />
        <Text className="text-xs font-bold uppercase text-zinc-600">
          {typeLabel}
        </Text>
        {alert.severity === "urgent" && (
          <View className="bg-red-500 rounded-full px-2 py-0.5 ml-auto">
            <Text className="text-white text-xs font-bold">URGENT</Text>
          </View>
        )}
      </View>

      <Text className="font-bold text-zinc-900 text-base">{alert.title}</Text>
      <Text className="text-zinc-500 text-xs mt-1">{alert.vehicleLabel}</Text>

      <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-white/40">
        <AlertCircle color={config.iconColor} size={16} />
        <Text className={`text-sm font-semibold ${config.text} flex-1`}>
          {alert.detail}
        </Text>
      </View>

      {alert.dueDate && (
        <View className="flex-row justify-between mt-2">
          <Text className="text-zinc-500 text-xs">Échéance</Text>
          <Text className="text-zinc-900 text-xs font-semibold">
            {formatDate(alert.dueDate)}
          </Text>
        </View>
      )}
      {alert.dueMileage && (
        <View className="flex-row justify-between mt-1">
          <Text className="text-zinc-500 text-xs">À</Text>
          <Text className="text-zinc-900 text-xs font-semibold">
            {formatMileage(alert.dueMileage)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
