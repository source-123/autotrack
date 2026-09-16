import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Car, Wrench, Bell, Sparkles, Crown, Check, ArrowRight,
} from "lucide-react-native";
import { useTranslation } from "../../lib/useTranslation";
import { useAuthStore } from "../../lib/authStore";
import { useWelcomeStore } from "../../lib/welcomeStore";

export default function WelcomeScreen() {
  const { lang } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const markSeen = useWelcomeStore((s) => s.markSeen);
  const dismiss = useWelcomeStore((s) => s.dismiss);
  const resetDismiss = useWelcomeStore((s) => s.resetDismiss);
  const isAr = lang === "ar";
  const [neverShow, setNeverShow] = useState(false);

  const handleStart = () => {
    // 1. D'abord, marquer la session comme dismissed (SYNCHRONE)
    dismiss();

    // 2. Si "ne plus afficher" coché, marquer aussi
    if (neverShow && user?.uid) {
      markSeen(user.uid);
    }

    // 3. Naviguer vers l'accueil
    router.replace("/(tabs)");
  };

  const handleNeverShow = () => {
    // Marque comme vu définitivement
    if (user?.uid) markSeen(user.uid);
    router.replace("/(tabs)");
  };

  const steps = [
    {
      icon: Car,
      color: "#2563eb",
      titleFr: "Ajoute ton véhicule",
      titleAr: "أضف سيارتك",
      descFr: "Enregistre les infos : marque, modèle, plaque, km",
      descAr: "سجل المعلومات: الماركة، الطراز، اللوحة، العداد",
    },
    {
      icon: Wrench,
      color: "#8b5cf6",
      titleFr: "Suis l'entretien",
      titleAr: "تابع الصيانة",
      descFr: "Vidange, freins, pneus, batterie...",
      descAr: "زيت، فرامل، إطارات، بطارية...",
    },
    {
      icon: Bell,
      color: "#f59e0b",
      titleFr: "Reçois des rappels",
      titleAr: "استقبل تنبيهات",
      descFr: "Assurance, visite technique, échéances",
      descAr: "التأمين، الفحص الفني، المواعيد",
    },
    {
      icon: Sparkles,
      color: "#ec4899",
      titleFr: "Assistant IA inclus",
      titleAr: "مساعد ذكي مدمج",
      descFr: "Pose des questions sur ta voiture",
      descAr: "اسأل أي شيء عن سيارتك",
    },
  ];

  const premiumFeatures = [
    isAr ? "سيارات غير محدودة" : "Véhicules illimités",
    isAr ? "المساعد الذكي" : "Assistant IA",
    isAr ? "تصدير PDF" : "Export PDF",
    isAr ? "المستندات" : "Documents",
  ];

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#2563eb",
            paddingTop: 60,
            paddingBottom: 30,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 180, height: 70 }}
              contentFit="contain"
            />
          </View>

          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {isAr ? "مرحباً بك 👋" : "Bienvenue 👋"}
          </Text>
          <Text
            style={{
              color: "#bfdbfe",
              fontSize: 14,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            {isAr
              ? "مساعدك لمتابعة وصيانة سيارتك بسهولة"
              : "Ton assistant pour suivre et entretenir ta voiture facilement"}
          </Text>
        </View>

        {/* Body */}
        <View style={{ padding: 24, gap: 14 }}>
          {/* Steps */}
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  backgroundColor: "#f8fafc",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <View
                  style={{
                    backgroundColor: s.color + "20",
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <Icon color={s.color} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>
                    {isAr ? s.titleAr : s.titleFr}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {isAr ? s.descAr : s.descFr}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Premium teaser */}
          <View
            style={{
              backgroundColor: "#fef3c7",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#fcd34d",
              marginTop: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Crown color="#b45309" size={22} />
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#78350f" }}>
                {isAr ? "⭐ النسخة المميزة" : "⭐ Version Premium"}
              </Text>
            </View>
            <View style={{ gap: 6 }}>
              {premiumFeatures.map((f, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Check color="#b45309" size={16} />
                  <Text style={{ fontSize: 13, color: "#78350f" }}>{f}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => router.push("/premium" as any)}
              style={{
                backgroundColor: "#f59e0b",
                borderRadius: 12,
                paddingVertical: 12,
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Crown color="#fff" size={18} />
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {isAr ? "اكتشف الآن" : "Découvrir maintenant"}
              </Text>
            </Pressable>
          </View>

          {/* Checkbox "Ne plus afficher" */}
          <Pressable
            onPress={() => setNeverShow(!neverShow)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 12,
              paddingHorizontal: 4,
              marginTop: 4,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: neverShow ? "#2563eb" : "#cbd5e1",
                backgroundColor: neverShow ? "#2563eb" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {neverShow && <Check color="#fff" size={16} />}
            </View>
            <Text style={{ fontSize: 14, color: "#475569", flex: 1 }}>
              {isAr ? "عدم إظهار هذا الدليل مجدداً" : "Ne plus afficher ce guide au prochain démarrage"}
            </Text>
          </Pressable>

          {/* Start button */}
          <Pressable
            onPress={handleStart}
            style={{
              backgroundColor: "#2563eb",
              borderRadius: 16,
              paddingVertical: 16,
              marginTop: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {isAr ? "ابدأ الاستخدام" : "Commencer"}
            </Text>
            <ArrowRight color="#fff" size={20} />
          </Pressable>

          <Text style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 4, marginBottom: 20 }}>
            {isAr
              ? "يمكنك الوصول للدليل في أي وقت من القائمة الجانبية"
              : "Tu peux retrouver le guide à tout moment dans la sidebar"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
