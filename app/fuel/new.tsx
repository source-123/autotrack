import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useStore } from "../../lib/store";
import { goBackSafely } from "../../lib/navigation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useTranslation } from "../../lib/useTranslation";

export default function FuelFormScreen() {
  const { t } = useTranslation();
  const { vehicleId, id } = useLocalSearchParams<{ vehicleId: string; id?: string }>();
  const isEdit = !!id;

  const addFuel = useStore((s) => s.addFuel);
  const updateFuel = useStore((s) => s.updateFuel);
  const existing = useStore((s) => s.fuels.find((f) => f.id === id));
  const vehicle = useStore((s) => s.vehicles.find((v) => v.id === vehicleId));

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [mileage, setMileage] = useState("");
  const [station, setStation] = useState("");
  const [fullTank, setFullTank] = useState(true);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existing) {
      setDate(existing.date);
      setLiters(String(existing.liters));
      setPricePerLiter(String(existing.pricePerLiter));
      setMileage(String(existing.mileage));
      setStation(existing.station ?? "");
      setFullTank(existing.fullTank);
      setNotes(existing.notes ?? "");
    } else if (vehicle) {
      setMileage(String(vehicle.mileage));
    }
  }, [existing, vehicle]);

  const totalCost = (parseFloat(liters) || 0) * (parseFloat(pricePerLiter) || 0);

  const handleSave = () => {
    if (!liters.trim() || !pricePerLiter.trim() || !mileage.trim()) {
      Alert.alert(t("missingFields"), `${t("liters")}, ${t("pricePerLiter")}, ${t("mileage")}`);
      return;
    }

    const data = {
      vehicleId: vehicleId || existing?.vehicleId || "",
      date,
      liters: parseFloat(liters) || 0,
      pricePerLiter: parseFloat(pricePerLiter) || 0,
      totalCost,
      mileage: parseInt(mileage) || 0,
      station: station.trim() || undefined,
      fullTank,
      notes: notes.trim() || undefined,
    };

    if (isEdit && id) updateFuel(id, data);
    else addFuel(data);

    goBackSafely();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? t("editFuel") : t("newFuel"), headerShown: true }} />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <Card>
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : "Véhicule"}
            </Text>

            <View className="gap-3">
              <Input label={t("date")} value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ" />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label={`${t("liters")} *`}
                    value={liters}
                    onChangeText={setLiters}
                    keyboardType="decimal-pad"
                    placeholder="45.5"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={`${t("pricePerLiter")} *`}
                    value={pricePerLiter}
                    onChangeText={setPricePerLiter}
                    keyboardType="decimal-pad"
                    placeholder="2.5"
                  />
                </View>
              </View>

              <View style={{ backgroundColor: "#dbeafe" }} className="rounded-xl p-3">
                <Text className="text-blue-800 text-xs uppercase font-semibold">{t("total")}</Text>
                <Text className="text-blue-900 text-2xl font-bold mt-1">
                  {totalCost.toFixed(2)}
                </Text>
              </View>

              <Input
                label={`${t("mileage")} *`}
                value={mileage}
                onChangeText={setMileage}
                keyboardType="number-pad"
                placeholder="168000"
              />

              <Input
                label={`${t("station")} (${t("optional")})`}
                value={station}
                onChangeText={setStation}
                placeholder="Total, Shell, Agil..."
              />

              <Pressable
                onPress={() => setFullTank(!fullTank)}
                className="flex-row items-center gap-2 py-2"
              >
                <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                  fullTank ? "bg-blue-600 border-blue-600" : "border-slate-300"
                }`}>
                  {fullTank && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
                <Text className="text-slate-700 dark:text-slate-300">{t("fullTank")}</Text>
              </Pressable>

              <Input
                label={`${t("notes")} (${t("optional")})`}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Détails..."
              />
            </View>
          </Card>

          <Button
            title={uploading ? "Enregistrement..." : isEdit ? t("update") : t("save")}
            onPress={handleSave}
            loading={uploading}
            size="lg"
          />
        </View>
      </ScrollView>
    </>
  );
}
