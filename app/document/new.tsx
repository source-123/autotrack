import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { FileText, Image as ImageIcon, X } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { goBackSafely } from "../../lib/navigation";
import { useTranslation } from "../../lib/useTranslation";
import { TranslationKey } from "../../lib/i18n";
import { DocumentCategory } from "../../types";
import {
  pickImageForDoc, pickPdfForDoc, uploadDocumentImage, uploadDocumentPdf,
} from "../../lib/uploadDocument";

const CATEGORIES: { key: DocumentCategory; labelKey: TranslationKey }[] = [
  { key: "assurance", labelKey: "catInsurance" },
  { key: "visite_technique", labelKey: "catInspection" },
  { key: "carte_grise", labelKey: "catRegistration" },
  { key: "facture_entretien", labelKey: "catMaintenanceInvoice" },
  { key: "facture_reparation", labelKey: "catRepairInvoice" },
  { key: "pneus", labelKey: "catTires" },
  { key: "autre", labelKey: "catOther" },
];

export default function DocumentFormScreen() {
  const { t } = useTranslation();
  const { vehicleId, id } = useLocalSearchParams<{ vehicleId: string; id?: string }>();
  const isEdit = !!id;

  const addDocument = useStore((s) => s.addDocument);
  const updateDocument = useStore((s) => s.updateDocument);
  const existing = useStore((s) => s.documents.find((d) => d.id === id));

  const [category, setCategory] = useState<DocumentCategory>("assurance");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "pdf">("image");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existing) {
      setCategory(existing.category);
      setTitle(existing.title);
      setFileUrl(existing.fileUrl);
      setFileType(existing.fileType);
      setDate(existing.date);
      setExpiryDate(existing.expiryDate ?? "");
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const handlePickImage = async () => {
    const result = await pickImageForDoc();
    if (!result) return;
    setUploading(true);
    try {
      const url = await uploadDocumentImage(result.uri);
      setFileUrl(url);
      setFileType("image");
    } catch (e: any) {
      Alert.alert(t("invalidFile"), e?.message || "");
    } finally {
      setUploading(false);
    }
  };

  const handlePickPdf = async () => {
    const result = await pickPdfForDoc();
    if (!result) return;
    setUploading(true);
    try {
      const url = await uploadDocumentPdf(result.uri);
      setFileUrl(url);
      setFileType("pdf");
      if (!title.trim()) setTitle(result.name);
    } catch (e: any) {
      Alert.alert(t("invalidFile"), e?.message || "");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !fileUrl) {
      Alert.alert(t("missingFields"), `${t("documentTitle")}, ${t("documentFile")}`);
      return;
    }
    const data = {
      vehicleId: vehicleId || existing?.vehicleId || "",
      category,
      title: title.trim(),
      fileUrl,
      fileType,
      date,
      expiryDate: expiryDate || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEdit && id) updateDocument(id, data);
    else addDocument(data);
    goBackSafely();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? t("editDocument") : t("newDocument"), headerShown: true }} />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <Field label={t("documentCategory")}>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={`px-3 py-2 rounded-full border ${category === c.key ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"}`}
                >
                  <Text className={category === c.key ? "text-white font-semibold text-xs" : "text-slate-700 dark:text-slate-200 text-xs"}>
                    {t(c.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={`${t("documentTitle")} *`}>
            <TextInput value={title} onChangeText={setTitle}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("documentFile")} *`}>
            {fileUrl ? (
              <View className="relative">
                {fileType === "image" ? (
                  <Image source={{ uri: fileUrl }} style={{ width: "100%", height: 200, borderRadius: 12 }} contentFit="cover" />
                ) : (
                  <View className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-6 items-center">
                    <FileText color="#2563eb" size={48} />
                    <Text className="text-slate-700 dark:text-slate-300 mt-2 text-sm">{t("documentFile")}</Text>
                  </View>
                )}
                <Pressable onPress={() => setFileUrl("")}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2">
                  <X color="#fff" size={16} />
                </Pressable>
              </View>
            ) : (
              <View className="flex-row gap-2">
                <Pressable onPress={handlePickImage} disabled={uploading}
                  className="flex-1 bg-white dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-6 items-center">
                  <ImageIcon color="#64748b" size={32} />
                  <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold mt-2">{t("pickImage")}</Text>
                </Pressable>
                <Pressable onPress={handlePickPdf} disabled={uploading}
                  className="flex-1 bg-white dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-6 items-center">
                  <FileText color="#64748b" size={32} />
                  <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold mt-2">{t("pickFile")}</Text>
                </Pressable>
              </View>
            )}
          </Field>

          <Field label={t("date")}>
            <TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("documentExpiry")} (${t("optional")})`}>
            <TextInput value={expiryDate} onChangeText={setExpiryDate} placeholder="AAAA-MM-JJ"
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Field label={`${t("notes")} (${t("optional")})`}>
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
          </Field>

          <Pressable onPress={handleSave} disabled={uploading}
            className="bg-blue-600 rounded-xl py-4 mt-4 active:bg-blue-700">
            <Text className="text-white text-center font-bold text-base">
              {uploading ? t("saving") : isEdit ? t("update") : t("save")}
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
