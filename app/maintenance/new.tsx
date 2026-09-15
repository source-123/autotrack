import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useStore } from "../../lib/store";
import { goBackSafely } from "../../lib/navigation";
import { useTranslation } from "../../lib/useTranslation";
import { TranslationKey } from "../../lib/i18n";
import { MaintenanceType } from "../../types";

const TYPES: { key: MaintenanceType; labelKey: TranslationKey }[] = [
  { key: "vidange", labelKey: "typeOilChange" },
  { key: "filtre_air", labelKey: "typeAirFilter" },
  { key: "filtre_huile", labelKey: "typeOilFilter" },
  { key: "bougies", labelKey: "typeSparkPlugs" },
  { key: "plaquettes", labelKey: "typeBrakePads" },
  { key: "pneus", labelKey: "typeTires" },
  { key: "batterie", labelKey: "typeBattery" },
  { key: "courroie", labelKey: "typeBelt" },
  { key: "chaine", labelKey: "typeChain" },
  { key: "autre", labelKey: "typeOther" },
];

export default function MaintenanceFormScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t("missingFields"), t("mileage"));
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
      <Stack.Screen options={{ title: isEdit ? t("editMaintenance") : t("newMaintenance"), headerShown: true }} />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <Field label={t("maintenanceType")}>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((tt) => (
                <Pressable
                  key={tt.key}
                  onPress={() => setType(tt.key)}
                  className={`px-3 py-2 rounded-full border ${type === tt.key ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"}`}
                >
                  <Text className={type === tt.key ? "text-white font-semibold text-xs" : "text-slate-700 dark:text-slate-200 text-xs"}>
                    {t(tt.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={t("interventionDate")}>
            <TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("mileage")} *`}>
            <TextInput value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="45000"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={t("cost")}>
            <TextInput value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="120"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("garage")} (${t("optional")})`}>
            <TextInput value={garage} onChangeText={setGarage} placeholder="Speedy, Norauto..."
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("notes")} (${t("optional")})`}>
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <View className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <Text className="text-amber-800 dark:text-amber-200 font-semibold text-sm mb-3">{t("nextReminder")}</Text>
            <Field label={t("date")}>
              <TextInput value={nextDueDate} onChangeText={setNextDueDate} placeholder="AAAA-MM-JJ"
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
            </Field>
            <View className="h-3" />
            <Field label={t("orMileage")}>
              <TextInput value={nextDueMileage} onChangeText={setNextDueMileage} keyboardType="number-pad" placeholder="60000"
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
            </Field>
          </View>

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
