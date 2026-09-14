import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { goBackSafely } from "../../lib/navigation";
import { useStore } from "../../lib/store";
import { Vehicle } from "../../types";

const FUELS: Vehicle["fuel"][] = ["essence", "diesel", "electrique", "hybride", "gpl"];

export default function VehicleFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const addVehicle = useStore((s) => s.addVehicle);
  const updateVehicle = useStore((s) => s.updateVehicle);
  const existing = useStore((s) => s.vehicles.find((v) => v.id === id));

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState<Vehicle["fuel"]>("essence");

  useEffect(() => {
    if (existing) {
      setBrand(existing.brand);
      setModel(existing.model);
      setYear(String(existing.year));
      setPlate(existing.plate);
      setVin(existing.vin ?? "");
      setMileage(String(existing.mileage));
      setFuel(existing.fuel);
    }
  }, [existing]);

  const handleSave = () => {
    if (!brand.trim() || !model.trim() || !plate.trim() || !mileage.trim()) {
      Alert.alert("Champs manquants", "Marque, modèle, plaque et km sont obligatoires.");
      return;
    }
    const data = {
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year) || new Date().getFullYear(),
      plate: plate.trim().toUpperCase(),
      vin: vin.trim() || undefined,
      mileage: parseInt(mileage) || 0,
      fuel,
    };
    if (isEdit && id) updateVehicle(id, data);
    else addVehicle(data);
    goBackSafely();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "Modifier le véhicule" : "Nouveau véhicule", headerShown: true }} />
      <ScrollView className="flex-1 bg-zinc-50">
        <View className="p-4 gap-4">
          <Field label="Marque *">
            <TextInput value={brand} onChangeText={setBrand} placeholder="Renault, Peugeot..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Modèle *">
            <TextInput value={model} onChangeText={setModel} placeholder="Clio, 208..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Année">
                <TextInput value={year} onChangeText={setYear} keyboardType="number-pad" placeholder="2020"
                  className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="Plaque *">
                <TextInput value={plate} onChangeText={setPlate} autoCapitalize="characters" placeholder="AB-123-CD"
                  className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
              </Field>
            </View>
          </View>

          <Field label="Kilométrage actuel *">
            <TextInput value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="45000"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="VIN (optionnel)">
            <TextInput value={vin} onChangeText={setVin} autoCapitalize="characters" placeholder="VF1..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Carburant">
            <View className="flex-row flex-wrap gap-2">
              {FUELS.map((f) => (
                <Pressable key={f} onPress={() => setFuel(f)}
                  className={`px-4 py-2 rounded-full border ${fuel === f ? "bg-blue-500 border-blue-500" : "bg-white border-zinc-200"}`}>
                  <Text className={`capitalize ${fuel === f ? "text-white font-semibold" : "text-zinc-700"}`}>{f}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Pressable onPress={handleSave} className="bg-blue-500 rounded-xl py-4 mt-4 active:bg-blue-600">
            <Text className="text-white text-center font-bold text-base">
              {isEdit ? "Mettre à jour" : "Enregistrer le véhicule"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-zinc-700">{label}</Text>
      {children}
    </View>
  );
}
