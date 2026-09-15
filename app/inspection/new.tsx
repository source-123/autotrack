import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useStore } from "../../lib/store";
import { goBackSafely } from "../../lib/navigation";
import { useTranslation } from "../../lib/useTranslation";

export default function InspectionFormScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t("missingFields"), t("expirationDate"));
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
      <Stack.Screen options={{ title: isEdit ? t("edit") : t("inspectionTitle"), headerShown: true }} />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <Field label={t("inspectionDate")}>
            <TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("expirationDate")} *`}>
            <TextInput value={expiryDate} onChangeText={setExpiryDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={t("result")}>
            <View className="flex-row gap-2">
              <Pressable onPress={() => setResult("pass")}
                className={`flex-1 py-3 rounded-xl border ${result === "pass" ? "bg-green-500 border-green-500" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"}`}>
                <Text className={result === "pass" ? "text-white font-bold text-center" : "text-slate-700 dark:text-slate-200 text-center"}>
                  {t("favorable")}
                </Text>
              </Pressable>
              <Pressable onPress={() => setResult("fail")}
                className={`flex-1 py-3 rounded-xl border ${result === "fail" ? "bg-red-500 border-red-500" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"}`}>
                <Text className={result === "fail" ? "text-white font-bold text-center" : "text-slate-700 dark:text-slate-200 text-center"}>
                  {t("unfavorable")}
                </Text>
              </Pressable>
            </View>
          </Field>

          <Field label={t("cost")}>
            <TextInput value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="85"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("center")} (${t("optional")})`}>
            <TextInput value={center} onChangeText={setCenter} placeholder="Dekra, Autosur..."
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("notes")} (${t("optional")})`}>
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Pressable onPress={handleSave} className="bg-blue-600 rounded-xl py-4 mt-4 active:bg-blue-700">
            <Text className="text-white text-center font-bold text-base">
              {isEdit ? t("update") : t("save")}
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
      <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      {children}
    </View>
  );
}
