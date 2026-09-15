import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { useTranslation } from "../../lib/useTranslation";
import { askGemini } from "../../lib/ai";
import { buildUserContext, getPredictionPrompt } from "../../lib/aiPrompts";

export default function AnalysisScreen() {
  const { t, lang } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const vehicle = useStore((s) => s.vehicles.find((v) => v.id === id));
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const fuels = useStore((s) => s.fuels);
  const currency = useStore((s) => s.currency);

  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const runAnalysis = async () => {
    if (!vehicle) return;
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const userContext = buildUserContext(
        [vehicle],
        maintenances,
        insurances,
        inspections,
        fuels,
        currency
      );
      const systemPrompt = getPredictionPrompt(lang as "fr" | "ar");
      const response = await askGemini(systemPrompt, userContext, {
        temperature: 0.5,
        maxTokens: 1500,
      });
      setAnalysis(response);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Text className="text-slate-500">{t("none")}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === "ar" ? "تحليل ذكي" : "Analyse IA",
          headerShown: true,
        }}
      />

      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-4">
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#2563eb" }}
          >
            <View className="flex-row items-center gap-3">
              <View className="rounded-full p-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <Sparkles color="#fff" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">
                  {lang === "ar" ? "تحليل ذكي" : "Analyse intelligente"}
                </Text>
                <Text className="text-blue-100 text-xs mt-1">
                  {vehicle.brand} {vehicle.model} • {vehicle.plate}
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-slate-900 dark:text-white font-bold mt-4 text-center">
                {lang === "ar" ? "جاري التحليل..." : "Analyse en cours..."}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs mt-2 text-center">
                {lang === "ar"
                  ? "يستغرق هذا 5-10 ثواني"
                  : "Cela prend 5 à 10 secondes"}
              </Text>
            </View>
          ) : null}

          {error && !loading ? (
            <View className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <AlertCircle color="#ef4444" size={20} />
                <Text className="font-bold text-red-700 dark:text-red-300">
                  {lang === "ar" ? "خطأ" : "Erreur"}
                </Text>
              </View>
              <Text className="text-red-600 dark:text-red-300 text-sm">{error}</Text>
            </View>
          ) : null}

          {analysis && !loading ? (
            <>
              <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                <Text className="text-slate-900 dark:text-white text-base">
                  {analysis}
                </Text>
              </View>

              <Pressable
                onPress={runAnalysis}
                className="bg-blue-600 rounded-xl py-4 flex-row items-center justify-center gap-2 active:bg-blue-700"
              >
                <RefreshCw color="#fff" size={20} />
                <Text className="text-white font-bold">
                  {lang === "ar" ? "إعادة التحليل" : "Relancer l'analyse"}
                </Text>
              </Pressable>
            </>
          ) : null}

          <View className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
            <Text className="text-slate-500 dark:text-slate-400 text-xs text-center">
              ⚠️ {lang === "ar"
                ? "هذا تحليل إحصائي وليس تشخيصاً ميكانيكياً."
                : "Ceci est une analyse statistique, pas un diagnostic mécanique."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
