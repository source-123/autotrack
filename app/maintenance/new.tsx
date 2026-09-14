import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { goBackSafely } from "../../lib/navigation";
import { useStore } from "../../lib/store";
import { MaintenanceType } from "../../types";

const TYPES: { key: MaintenanceType; label: string }[] = [
  { key: "vidange", label: "Vidange" },
  { key: "filtre_air", label: "Filtre à air" },
  { key: "filtre_huile", label: "Filtre à huile" },
  { key: "bougies", label: "Bougies" },
  { key: "plaquettes", label: "Plaquettes" },
  { key: "pneus", label: "Pneus" },
  { key: "batterie", label: "Batterie" },
  { key: "courroie", label: "Courroie" },
  { key: "chaine", label: "Chaîne" },
  { key: "autre", label: "Autre" },
];

export default function MaintenanceFormScreen() {
  const { vehicleId, id } = useLocalSearchParams<{ vehicleId: string; id?: string }>();
  const isEdit = !!id;

  const addMaintenance = useStore((s) => s.addMaintenance);
  const updateMaintenance = useStore((s) => s.updateMaintenance);
  const existing = useStore((s) => s.maintenances.find((m) => m.id === id));

  const [type, setType] = useState<MaintenanceType>("vidange");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");
  const [garage, setGarage] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [nextDueMileage, setNextDueMileage] = useState("");

  useEffect(() => {
    if (existing) {
      setType(existing.type);
      setDate(existing.date);
      setMileage(String(existing.mileage));
      setCost(existing.cost ? String(existing.cost) : "");
      setGarage(existing.garage ?? "");
      setNotes(existing.notes ?? "");
      setNextDueDate(existing.nextDueDate ?? "");
      setNextDueMileage(existing.nextDueMileage ? String(existing.nextDueMileage) : "");
    }
  }, [existing]);

  const handleSave = () => {
    if (!mileage.trim()) {
      Alert.alert("Champ manquant", "Le kilométrage est obligatoire.");
      return;
    }
    const data = {
      vehicleId: vehicleId || existing?.vehicleId || "",
      type,
      date,
      mileage: parseInt(mileage) || 0,
      cost: parseFloat(cost) || 0,
      garage: garage.trim() || undefined,
      notes: notes.trim() || undefined,
      nextDueDate: nextDueDate || undefined,
      nextDueMileage: parseInt(nextDueMileage) || undefined,
    };
    if (isEdit && id) updateMaintenance(id, data);
    else addMaintenance(data);
    goBackSafely();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "Modifier l'entretien" : "Nouvel entretien", headerShown: true }} />
      <ScrollView className="flex-1 bg-zinc-50">
        <View className="p-4 gap-4">
          <Field label="Type d'intervention">
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <Pressable key={t.key} onPress={() => setType(t.key)}
                  className={`px-3 py-2 rounded-full border ${type === t.key ? "bg-blue-500 border-blue-500" : "bg-white border-zinc-200"}`}>
                  <Text className={type === t.key ? "text-white font-semibold text-xs" : "text-zinc-700 text-xs"}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Date de l'intervention">
            <TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Kilométrage *">
            <TextInput value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="45000"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Coût">
            <TextInput value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="120"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Garage (optionnel)">
            <TextInput value={garage} onChangeText={setGarage} placeholder="Speedy, Norauto..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Notes (optionnel)">
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholder="Détails..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <View className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <Text className="text-amber-800 font-semibold text-sm mb-3">🔔 Prochain rappel (optionnel)</Text>
            <Field label="Date">
              <TextInput value={nextDueDate} onChangeText={setNextDueDate} placeholder="AAAA-MM-JJ"
                className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
            </Field>
            <View className="h-3" />
            <Field label="Ou kilométrage">
              <TextInput value={nextDueMileage} onChangeText={setNextDueMileage} keyboardType="number-pad" placeholder="60000"
                className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
            </Field>
          </View>

          <Pressable onPress={handleSave} className="bg-blue-500 rounded-xl py-4 mt-4 active:bg-blue-600">
            <Text className="text-white text-center font-bold text-base">
              {isEdit ? "Mettre à jour" : "Enregistrer"}
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
