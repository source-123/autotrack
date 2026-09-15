import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { router, Stack } from "expo-router";
import {
  ChevronLeft, ChevronRight, X, Shield, ClipboardCheck,
  Wrench, TrendingUp, Info, Check,
} from "lucide-react-native";
import { useOnboardingStore } from "../../lib/onboardingStore";
import { useTranslation } from "../../lib/useTranslation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";

const STEPS = (t: any) => [
  {
    icon: "🚗",
    title: t("step1Title"),
    description: t("step1Desc"),
    extra: t("step1Why"),
  },
  {
    icon: "🔧",
    title: t("step2Title"),
    description: t("step2Desc"),
    extra: t("step2Why"),
  },
  {
    icon: "🔔",
    title: t("step3Title"),
    description: t("step3Desc"),
    extra: t("step3Why"),
    examples: [
      { icon: "🛡️", label: t("insuranceNotif"), sub: "21 jours / 21 يوم" },
      { icon: "📋", label: t("inspectionNotif"), sub: "45 jours / 45 يوم" },
      { icon: "🔧", label: t("typeOilChange"), sub: "2 000 km / 2 000 كم" },
    ],
  },
  {
    icon: "📊",
    title: t("step4Title"),
    description: t("step4Desc"),
    examples: [
      { icon: "💰", label: t("annualExpenses"), sub: "2 000 DT" },
      { icon: "🛣️", label: t("costPerKm"), sub: "0,20 DT" },
      { icon: "⛽", label: t("consumptionTitle"), sub: "7 L/100 km" },
    ],
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [neverShow, setNeverShow] = useState(false);
  const insets = useSafeAreaInsets();
  const { markCompleted, setNeverShow: saveNeverShow } = useOnboardingStore();
  const { t } = useTranslation();

  const steps = STEPS(t);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const finish = () => {
    saveNeverShow(neverShow);
    markCompleted();
    router.replace("/(tabs)");
  };

  const skip = () => {
    saveNeverShow(neverShow);
    markCompleted();
    router.replace("/(tabs)");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-1 bg-white dark:bg-slate-900"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 130, height: 60 }}
            contentFit="contain"
          />
          <Pressable onPress={skip} className="p-2">
            <Text className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
              {t("skip")}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
          {/* Titre (étape 1 uniquement) */}
          {step === 0 && (
            <View className="mb-6">
              <Text className="text-3xl font-bold text-slate-900 dark:text-white">
                {t("welcome")}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 mt-3 text-base leading-6">
                {t("welcomeSubtitle")}
              </Text>
            </View>
          )}

          {/* Icône */}
          <View className="items-center mt-4 mb-8">
            <View className="bg-blue-50 dark:bg-blue-950 rounded-full w-32 h-32 items-center justify-center">
              <Text className="text-6xl">{current.icon}</Text>
            </View>
          </View>

          {/* Contenu */}
          <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            {current.title}
          </Text>
          <Text className="text-slate-600 dark:text-slate-300 text-center mt-4 text-base leading-6">
            {current.description}
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 text-center mt-4 text-sm italic">
            {current.extra}
          </Text>

          {/* Exemples */}
          {current.examples && (
            <View className="mt-6 gap-2">
              {current.examples.map((ex, i) => (
                <View
                  key={i}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex-row items-center gap-4"
                >
                  <Text className="text-3xl">{ex.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-bold">
                      {ex.label}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      {ex.sub}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Lien guide calculs (étapes 3 et 4) */}
          {(step === 2 || step === 3) && (
            <Pressable
              onPress={() => router.push("/onboarding/calculations")}
              className="mt-6 flex-row items-center justify-center gap-2 py-3"
            >
              <Info color="#2563eb" size={18} />
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                {t("howCalculate")}
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Progression */}
          <View className="flex-row justify-center gap-2 mb-5">
            {steps.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-8 bg-blue-600"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </View>

          {/* Boutons */}
          <View className="flex-row gap-3">
            {step > 0 && (
              <Pressable
                onPress={() => setStep(step - 1)}
                className="flex-1 py-4 rounded-xl border border-slate-200 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800 flex-row items-center justify-center gap-2"
              >
                <ChevronLeft color="#64748b" size={20} />
                <Text className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t("back")}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => (isLast ? finish() : setStep(step + 1))}
              className="flex-1 py-4 rounded-xl bg-blue-600 active:bg-blue-700 flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-bold">
                {isLast ? t("start") : t("next")}
              </Text>
              {!isLast && <ChevronRight color="#fff" size={20} />}
            </Pressable>
          </View>

          {/* Ne plus afficher */}
          <Pressable
            onPress={() => setNeverShow(!neverShow)}
            className="flex-row items-center justify-center gap-2 mt-5"
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                neverShow ? "bg-blue-600 border-blue-600" : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {neverShow && <Check color="#fff" size={14} />}
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
              {t("dontShowAgain")}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
