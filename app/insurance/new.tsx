import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { goBackSafely } from "../../lib/navigation";
import { useStore } from "../../lib/store";
import { Insurance } from "../../types";

const TYPES: { key: Insurance["type"]; label: string }[] = [
  { key: "tous_risques", label: "Tous risques" },
  { key: "intermediaire", label: "Intermédiaire" },
  { key: "tiers", label: "Au tiers" },
];

export default function InsuranceFormScreen() {
  const { vehicleId, id } = useLocalSearchParams<{ vehicleId: string; id?: string }>();
  const isEdit = !!id;

  const addInsurance = useStore((s) => s.addInsurance);
  const updateInsurance = useStore((s) => s.updateInsurance);
  const existing = useStore((s) => s.insurances.find((i) => i.id === id));

  const [company, setCompany] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [type, setType] = useState<Insurance["type"]>("tous_risques");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existing) {
      setCompany(existing.company);
      setPolicyNumber(existing.policyNumber ?? "");
      setType(existing.type);
      setStartDate(existing.startDate);
      setEndDate(existing.endDate);
      setCost(existing.cost ? String(existing.cost) : "");
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const handleSave = () => {
    if (!company.trim() || !endDate) {
      Alert.alert("Champs manquants", "Compagnie et date de fin obligatoires.");
      return;
    }
    const data = {
      vehicleId: vehicleId || existing?.vehicleId || "",
      company: company.trim(),
      policyNumber: policyNumber.trim(),
      type,
      startDate,
      endDate,
      cost: parseFloat(cost) || 0,
      notes: notes.trim() || undefined,
    };
    if (isEdit && id) updateInsurance(id, data);
    else addInsurance(data);
    goBackSafely();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "Modifier l'assurance" : "Nouvelle assurance", headerShown: true }} />
      <ScrollView className="flex-1 bg-zinc-50">
        <View className="p-4 gap-4">
          <Field label="Compagnie *">
            <TextInput value={company} onChangeText={setCompany} placeholder="MAIF, AXA..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="N° de police">
            <TextInput value={policyNumber} onChangeText={setPolicyNumber} placeholder="ABC123..."
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Type de contrat">
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <Pressable key={t.key} onPress={() => setType(t.key)}
                  className={`px-4 py-2 rounded-full border ${type === t.key ? "bg-blue-500 border-blue-500" : "bg-white border-zinc-200"}`}>
                  <Text className={type === t.key ? "text-white font-semibold" : "text-zinc-700"}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Date de début">
            <TextInput value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Date de fin *">
            <TextInput value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Coût annuel">
            <TextInput value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="650"
              className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900" />
          </Field>

          <Field label="Notes (optionnel)">
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholder="Détails..."
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
