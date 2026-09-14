import { View, Text, ScrollView } from "react-native";
import { useMemo } from "react";
import { TrendingUp, Car, Wrench, Shield, ClipboardCheck } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { Fuel } from "../../types";
import { formatMoney } from "../../lib/utils";
import { Card } from "../../components/ui/Card";
import { BarChart } from "../../components/charts/BarChart";
import { maintenanceColors } from "../../lib/theme";

export default function StatsScreen() {
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const fuels = useStore((s) => s.fuels);
  const currency = useStore((s) => s.currency);

  // ===== Coût total par mois sur 12 derniers mois =====
  const monthlyData = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

      const maintCost = maintenances
        .filter((m) => m.date.startsWith(monthStr))
        .reduce((sum, m) => sum + m.cost, 0);
      const insCost = insurances
        .filter((i) => i.startDate.startsWith(monthStr))
        .reduce((sum, i) => sum + i.cost, 0);
      const inspCost = inspections
        .filter((i) => i.date.startsWith(monthStr))
        .reduce((sum, i) => sum + i.cost, 0);
      const fuelCost = fuels
        .filter((f) => f.date.startsWith(monthStr))
        .reduce((sum, f) => sum + f.totalCost, 0);

      months.push({
        label: monthLabels[month],
        value: maintCost + insCost + inspCost + fuelCost,
      });
    }
    return months;
  }, [maintenances, insurances, inspections, fuels]);

  const totalThisYear = useMemo(() => {
    const yearStart = `${new Date().getFullYear()}-01-01`;
    return (
      maintenances.filter((m) => m.date >= yearStart).reduce((s, m) => s + m.cost, 0) +
      insurances.filter((i) => i.startDate >= yearStart).reduce((s, i) => s + i.cost, 0) +
      inspections.filter((i) => i.date >= yearStart).reduce((s, i) => s + i.cost, 0) +
      fuels.filter((f) => f.date >= yearStart).reduce((s, f) => s + f.totalCost, 0)
    );
  }, [maintenances, insurances, inspections, fuels]);

  // ===== Répartition par catégorie =====
  const categoryData = useMemo(() => {
    const yearStart = `${new Date().getFullYear()}-01-01`;
    return {
      maintenance: maintenances.filter((m) => m.date >= yearStart).reduce((s, m) => s + m.cost, 0),
      insurance: insurances.filter((i) => i.startDate >= yearStart).reduce((s, i) => s + i.cost, 0),
      inspection: inspections.filter((i) => i.date >= yearStart).reduce((s, i) => s + i.cost, 0),
    };
  }, [maintenances, insurances, inspections]);

  // ===== Top entretiens par coût =====
  const topMaintenances = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of maintenances) {
      map.set(m.type, (map.get(m.type) || 0) + m.cost);
    }
    return Array.from(map.entries())
      .map(([type, cost]) => ({ type, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [maintenances]);

  const totalCategory = categoryData.maintenance + categoryData.insurance + categoryData.inspection || 1;

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-4 gap-4">
        {/* Total année */}
        <Card className="bg-blue-600" style={{ backgroundColor: "#2563eb" }}>
          <View className="flex-row items-center gap-2 mb-2">
            <TrendingUp color="#bfdbfe" size={18} />
            <Text className="text-blue-100 text-xs font-semibold uppercase">
              Dépenses {new Date().getFullYear()}
            </Text>
          </View>
          <Text className="text-white text-3xl font-bold">
            {formatMoney(totalThisYear, currency)}
          </Text>
          <Text className="text-blue-100 text-xs mt-1">
            {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} • {maintenances.length + insurances.length + inspections.length} entrées
          </Text>
        </Card>

        {/* Graphique mensuel */}
        <Card>
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Dépenses sur 12 mois
          </Text>
          <BarChart data={monthlyData} height={200} formatValue={(v) => formatMoney(v, currency)} />
        </Card>

        {/* Répartition par catégorie */}
        <Card>
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Répartition {new Date().getFullYear()}
          </Text>

          <CategoryRow
            icon={<Wrench color="#f59e0b" size={18} />}
            label="Entretiens"
            value={categoryData.maintenance}
            total={totalCategory}
            currency={currency}
            color="#f59e0b"
          />
          <CategoryRow
            icon={<Shield color="#3b82f6" size={18} />}
            label="Assurances"
            value={categoryData.insurance}
            total={totalCategory}
            currency={currency}
            color="#3b82f6"
          />
          <CategoryRow
            icon={<ClipboardCheck color="#10b981" size={18} />}
            label="Visites techniques"
            value={categoryData.inspection}
            total={totalCategory}
            currency={currency}
            color="#10b981"
          />
        </Card>

        {/* Top entretiens */}
        {topMaintenances.length > 0 && (
          <Card>
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Top entretiens
            </Text>
            {topMaintenances.map((item) => {
              const colorInfo = maintenanceColors[item.type] || maintenanceColors.autre;
              return (
                <View key={item.type} className="flex-row justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <View className="flex-row items-center gap-3">
                    <View className={`w-8 h-8 rounded-lg items-center justify-center ${colorInfo.bg}`}>
                      <Text className={`text-xs font-bold ${colorInfo.text}`}>#</Text>
                    </View>
                    <Text className="text-slate-700 capitalize font-semibold text-sm">
                      {item.type.replace("_", " ")}
                    </Text>
                  </View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">
                    {formatMoney(item.cost, currency)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Stats véhicules */}
        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <Car color="#2563eb" size={18} />
            <Text className="text-base font-bold text-slate-900">Par véhicule</Text>
          </View>
          {vehicles.length === 0 ? (
            <Text className="text-slate-400 text-center py-4 text-sm">Aucun véhicule</Text>
          ) : (
            vehicles.map((v) => {
              const cost =
                maintenances.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0) +
                insurances.filter((i) => i.vehicleId === v.id).reduce((s, i) => s + i.cost, 0) +
                inspections.filter((i) => i.vehicleId === v.id).reduce((s, i) => s + i.cost, 0);
              return (
                <View key={v.id} className="flex-row justify-between py-2 border-b border-slate-100 last:border-0">
                  <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {v.brand} {v.model}
                  </Text>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">
                    {formatMoney(cost, currency)}
                  </Text>
                </View>
              );
            })
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function CategoryRow({
  icon, label, value, total, currency, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  currency: any;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">{label}</Text>
        </View>
        <Text className="text-slate-900 dark:text-white font-bold text-sm">
          {formatMoney(value, currency)}
        </Text>
      </View>
      <View className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <View
          style={{ width: `${pct}%`, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
      <Text className="text-slate-400 text-xs mt-1">{pct.toFixed(0)}%</Text>
    </View>
  );
}
