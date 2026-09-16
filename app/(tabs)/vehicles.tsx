import { View, Text, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { Plus, Car } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { formatMileage } from "../../lib/utils";
import { Vehicle } from "../../types";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../lib/useTranslation";
import { usePremium } from "../../lib/premiumStore";

export default function VehiclesScreen() {
  const { t, lang } = useTranslation();
  const vehicles = useStore((s) => s.vehicles);
  const { isPremium } = usePremium();
  const canAddMore = isPremium || vehicles.length < 1;

  return (
    <>
      <Stack.Screen
        options={{
          title: t("tabVehicles"),
          headerRight: () => (
            <Pressable
              onPress={() => {
                if (canAddMore) {
                  router.push("/vehicle/new");
                } else {
                  const { Alert } = require("react-native");
                  Alert.alert(
                    t("noVehicle"),
                    lang === "ar"
                      ? "النسخة المجانية تسمح بسيارة واحدة فقط. اشترك للفتح."
                      : "La version gratuite permet 1 seul véhicule. Abonne-toi pour en ajouter plus.",
                    [
                      { text: t("cancel"), style: "cancel" },
                      { text: "Premium", onPress: () => router.push("/premium") },
                    ]
                  );
                }
              }}
              className="mr-4"
            >
              <Plus color={canAddMore ? "#2563eb" : "#94a3b8"} size={24} />
            </Pressable>
          ),
        }}
      />
      {vehicles.length === 0 ? (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center p-6">
          <View className="bg-blue-100 dark:bg-blue-950 rounded-full p-8 mb-5">
            <Car color="#2563eb" size={56} />
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">{t("noVehicle")}</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-center mt-2 mb-6 max-w-xs">
            {t("noVehicleDesc")}
          </Text>
          <Button
            title={t("addVehicle")}
            onPress={() => router.push("/vehicle/new")}
            icon={<Plus color="#fff" size={20} />}
          />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          className="bg-slate-50 dark:bg-slate-900"
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
        />
      )}
    </>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useTranslation();
  const hasPhoto = !!vehicle.photoUri && vehicle.photoUri.length > 0;

  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden active:bg-slate-50 dark:active:bg-slate-700"
    >
      {hasPhoto ? (
        <Image
          source={{ uri: vehicle.photoUri }}
          style={{ width: "100%", height: 180, backgroundColor: "#e2e8f0" }}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={{ width: "100%", height: 140, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" }}>
          <Car color="#fff" size={48} />
        </View>
      )}

      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5" style={{ writingDirection: "ltr" }}>
              {vehicle.plate} • {vehicle.year}
            </Text>
          </View>
          <View className="bg-blue-100 dark:bg-blue-950 rounded-full px-3 py-1">
            <Text className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
              {t(vehicle.fuel === "essence" ? "gasoline" : vehicle.fuel === "diesel" ? "diesel" : vehicle.fuel === "electrique" ? "electric" : vehicle.fuel === "hybride" ? "hybrid" : "gpl")}
            </Text>
          </View>
        </View>
        <View className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex-row justify-between">
          <Text className="text-slate-500 dark:text-slate-400 text-xs">{t("mileage")}</Text>
          <Text className="text-slate-900 dark:text-white font-semibold text-sm">
            {formatMileage(vehicle.mileage)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
