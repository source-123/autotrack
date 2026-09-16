import { View, Text, ScrollView, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import {
  ArrowLeft, Crown, BookOpen, MessageCircle, HelpCircle,
  ChevronRight, Calculator, Shield, Sparkles, FileText,
} from "lucide-react-native";
import { useTranslation } from "../../lib/useTranslation";

export default function HelpScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const sections = [
    {
      icon: BookOpen,
      title: isAr ? "الدليل الكامل" : "Guide complet",
      description: isAr
        ? "شرح مفصل لكل ميزة في التطبيق"
        : "Explications détaillées de chaque fonctionnalité",
      route: "/onboarding",
      color: "#2563eb",
    },
    {
      icon: Calculator,
      title: isAr ? "فهم الإحصائيات" : "Comprendre mes statistiques",
      description: isAr
        ? "كيف يتم حساب كل الأرقام في التطبيق"
        : "Comment sont calculés tous les chiffres",
      route: "/onboarding/calculations",
      color: "#10b981",
    },
    {
      icon: Crown,
      title: isAr ? "النسخة المميزة" : "Premium",
      description: isAr
        ? "مزايا النسخة المميزة وكيفية الاشتراك"
        : "Avantages Premium et comment s'abonner",
      route: "/premium",
      color: "#f59e0b",
    },
    {
      icon: Sparkles,
      title: isAr ? "المساعد الذكي" : "Assistant IA",
      description: isAr
        ? "اسأل أي شيء عن سيارتك"
        : "Pose n'importe quelle question sur ta voiture",
      route: "/(tabs)/assistant",
      color: "#8b5cf6",
    },
    {
      icon: FileText,
      title: isAr ? "تصدير PDF" : "Export PDF",
      description: isAr
        ? "أنشئ سجل صيانة احترافي"
        : "Générer un carnet d'entretien professionnel",
      route: "/(tabs)/vehicles",
      color: "#ef4444",
    },
    {
      icon: Shield,
      title: isAr ? "الخصوصية والأمان" : "Confidentialité & sécurité",
      description: isAr
        ? "كيف نحمي بياناتك"
        : "Comment on protège tes données",
      route: "/help/privacy",
      color: "#0891b2",
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: isAr ? "المساعدة والدليل" : "Aide & guide",
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <ArrowLeft color="#2563eb" size={24} />
            </Pressable>
          ),
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-3">
          {/* Header */}
          <View
            style={{ backgroundColor: "#2563eb", borderRadius: 20, padding: 20, marginBottom: 8 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, padding: 10 }}>
                <HelpCircle color="#fff" size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                  {isAr ? "مركز المساعدة" : "Centre d'aide"}
                </Text>
                <Text style={{ color: "#bfdbfe", fontSize: 13, marginTop: 2 }}>
                  {isAr
                    ? "كل ما تحتاج معرفته عن Car Autotrack"
                    : "Tout ce qu'il faut savoir sur Car Autotrack"}
                </Text>
              </View>
            </View>
          </View>

          {/* Sections */}
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <Pressable
                key={i}
                onPress={() => router.push(s.route as any)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    backgroundColor: s.color + "15",
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <Icon color={s.color} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>
                    {s.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {s.description}
                  </Text>
                </View>
                <ChevronRight color="#94a3b8" size={20} />
              </Pressable>
            );
          })}

          {/* Contact WhatsApp */}
          <Pressable
            onPress={() => router.push("/premium" as any)}
            style={{
              backgroundColor: "#25d366",
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <MessageCircle color="#fff" size={22} />
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
              {isAr ? "تواصل معنا عبر واتساب" : "Nous contacter sur WhatsApp"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
