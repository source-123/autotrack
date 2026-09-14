import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { goBackSafely } from "../../lib/navigation";
import { useStore } from "../../lib/store";

export default function InspectionFormScreen() {
  const { vehicleId, id } = useLocalSearchParams<{ vehicleId: string; id?: string }>();
  const isEdit = !!id;

  const addInspection = useStore((s) => s.addInspection);
  const updateInspection = useStore((s) => s.updateInspection);
  const existing = useStore((s) => s.inspections.find((i) => i.id === id));

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState("");
  const [result, setResult] = useState<"pass" | "fail">("pass");
  const [cost, setCost] = useState("");
  const [center, setCenter] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existing) {
      setDate(existing.date);
      setExpiryDate(existing.expiryDate);
      setResult(existing.result);
      setCost(existing.cost ? String(existing.cost) : "");
      setCenter(existing.center ?? "");
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const handleSave = () => {
    if (!expiryDate) {
      Alert.alert("Champ manquant", "La date d'expiration est obligatoire.");
      return;
    }
    const data = {
      vehicleId: vehicleId || existing?.vehicleId || "",
      date,
      expiryDate,
      result,
      cost: parseFloat(cost) || 0,
      center: center.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEdit && id) updateInspection(id, data);
    else addInspection(data);
    goBackSafely();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "Modifier la visite" : "Visite technique", headerShown: true }} />
      <ScrollView className="flex-1 bg-zinc-50">
        <View className="p-4 gap-4">
          <Field label="Date du contrôle">
            <TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Date d'expiration *">
            <TextInput value={expiryDate} onChangeText={setExpiryDate} placeholder="AAAA-MM-JJ"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Résultat">
            <View className="flex-row gap-2">
              <Pressable onPress={() => setResult("pass")}
                className={`flex-1 py-3 rounded-xl border ${result === "pass" ? "bg-green-500 border-green-500" : "bg-white border-zinc-200"}`}>
                <Text className={result === "pass" ? "text-white font-bold text-center" : "text-zinc-700 text-center"}>
                  ✅ Favorable
                </Text>
              </Pressable>
              <Pressable onPress={() => setResult("fail")}
                className={`flex-1 py-3 rounded-xl border ${result === "fail" ? "bg-red-500 border-red-500" : "bg-white border-zinc-200"}`}>
                <Text className={result === "fail" ? "text-white font-bold text-center" : "text-zinc-700 text-center"}>
                  ❌ Défavorable
                </Text>
              </Pressable>
            </View>
          </Field>

          <Field label="Coût">
            <TextInput value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="85"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Centre (optionnel)">
            <TextInput value={center} onChangeText={setCenter} placeholder="Dekra, Autosur..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Notes (optionnel)">
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholder="Défauts mineurs..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

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
