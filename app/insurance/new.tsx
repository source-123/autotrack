import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useStore } from "../../lib/store";
import { goBackSafely } from "../../lib/navigation";
import { useTranslation } from "../../lib/useTranslation";
import { TranslationKey } from "../../lib/i18n";
import { Insurance } from "../../types";

const TYPES: { key: Insurance["type"]; labelKey: TranslationKey }[] = [
  { key: "tous_risques", labelKey: "typeAllRisk" },
  { key: "intermediaire", labelKey: "typeIntermediate" },
  { key: "tiers", labelKey: "typeThirdParty" },
];

export default function InsuranceFormScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t("missingFields"), `${t("company")}, ${t("endDate")}`);
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
      <Stack.Screen options={{ title: isEdit ? t("editInsurance") : t("newInsurance"), headerShown: true }} />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <Field label={`${t("company")} *`}>
            <TextInput value={company} onChangeText={setCompany} placeholder="MAIF, AXA..."
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={t("policyNumber")}>
            <TextInput value={policyNumber} onChangeText={setPolicyNumber} placeholder="ABC123..."
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={t("contractType")}>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((tt) => (
                <Pressable key={tt.key} onPress={() => setType(tt.key)}
                  className={`px-4 py-2 rounded-full border ${type === tt.key ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"}`}>
                  <Text className={type === tt.key ? "text-white font-semibold" : "text-slate-700 dark:text-slate-200"}>{t(tt.labelKey)}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={t("startDate")}>
            <TextInput value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("endDate")} *`}>
            <TextInput value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={t("annualCost")}>
            <TextInput value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="650"
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
