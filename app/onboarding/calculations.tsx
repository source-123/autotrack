import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { Calculator, TrendingUp, Fuel, Gauge, Wrench, Bell, Activity } from "lucide-react-native";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../lib/useTranslation";

function Section({
  icon, title, formula, example, note,
}: {
  icon: React.ReactNode;
  title: string;
  formula: string;
  example: string;
  note?: string;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <View className="flex-row items-center gap-3 mb-3">
        {icon}
        <Text className="text-lg font-bold text-slate-900 dark:text-white">{title}</Text>
      </View>

      <View className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 mb-3">
        <Text className="text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold mb-1">
          {t("formula")}
        </Text>
        <Text className="text-slate-900 dark:text-white font-mono text-sm">
          {formula}
        </Text>
      </View>

      <View className="bg-blue-50 dark:bg-blue-950 rounded-xl p-3">
        <Text className="text-blue-600 dark:text-blue-300 text-xs uppercase font-semibold mb-1">
          {t("example")}
        </Text>
        <Text className="text-slate-900 dark:text-white font-mono text-sm">
          {example}
        </Text>
      </View>

      {note && (
        <Text className="text-slate-500 dark:text-slate-400 text-xs italic mt-3">
          {note}
        </Text>
      )}
    </Card>
  );
}

export default function CalculationsScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Comment sont calculés\nmes statistiques ?",
          headerShown: true,
          headerTitleStyle: { fontSize: 16 },
        }}
      />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <View className="bg-blue-600 rounded-2xl p-4">
            <Text className="text-white text-base font-bold">
              {t("transparencyTitle")}
            </Text>
            <Text className="text-blue-100 text-sm mt-2 leading-5">
              {t("transparencyDesc")}
            </Text>
          </View>

          <Section
            icon={<Calculator color="#2563eb" size={22} />}
            title={t("totalExpensesTitle")}
            formula={`Entretien + Assurance + Visite technique
+ Carburant + Réparations + Autres`}
            example={`Entretien: 450 DT
Assurance: 500 DT
Carburant: 800 DT
Réparations: 250 DT
─────
Total: 2 000 DT`}
          />

          <Section
            icon={<TrendingUp color="#10b981" size={22} />}
            title={t("costPerKmTitle")}
            formula={`Dépenses sélectionnées ÷ Km parcourus`}
            example={`2 000 DT ÷ 10 000 km = 0,20 DT/km`}
            note="Les dépenses incluses sont celles de la période sélectionnée."
          />

          <Section
            icon={<Fuel color="#f59e0b" size={22} />}
            title={t("consumptionTitle")}
            formula={`Litres consommés ÷ Km parcourus × 100`}
            example={`350 L ÷ 5 000 km × 100 = 7 L/100 km`}
            note="Calcul disponible après avoir enregistré suffisamment de ravitaillements complets."
          />

          <Section
            icon={<Fuel color="#ef4444" size={22} />}
            title={t("fuelCostTitle")}
            formula={`Litres × Prix par litre`}
            example={`40 L × 2,525 DT = 101 DT`}
          />

          <Section
            icon={<Gauge color="#6366f1" size={22} />}
            title={t("kmTraveledTitle")}
            formula={`Kilométrage actuel − Kilométrage de départ`}
            example={`168 000 km − 160 000 km = 8 000 km`}
          />

          <Section
            icon={<Wrench color="#8b5cf6" size={22} />}
            title={t("nextMaintenanceTitle")}
            formula={`Dernier km + Intervalle (km)
Dernière date + Intervalle (mois)`}
            example={`160 000 km + 10 000 km = 170 000 km`}
          />

          <Section
            icon={<Bell color="#f59e0b" size={22} />}
            title={t("reminderTitle")}
            formula={`Date: Expiration − Aujourd'hui
Km: Prochain − Actuel`}
            example={`Expire dans 21 jours
Dans 2 000 km`}
          />

          <Section
            icon={<Activity color="#10b981" size={22} />}
            title={t("trackingScoreTitle")}
            formula={`Assurance (25) + Visite (25) + Entretien (20)
+ Carburant (15) + Km à jour (15) = 100`}
            example={`92% → Excellent`}
            note="⚠️ Ce score reflète la COMPLÉTUDE de vos données, PAS l'état mécanique réel du véhicule."
          />

          <View className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <Text className="text-amber-800 dark:text-amber-200 font-bold mb-2">
              {t("importantNote")}
            </Text>
            <Text className="text-amber-700 dark:text-amber-300 text-sm leading-5">
              {t("trackingScoreWarning")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
