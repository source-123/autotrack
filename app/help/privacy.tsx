import { View, Text, ScrollView, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import { ArrowLeft, Shield, Lock, Server, Eye, Trash2 } from "lucide-react-native";
import { useTranslation } from "../../lib/useTranslation";

export default function PrivacyScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const sections = [
    {
      icon: Lock,
      title: isAr ? "بياناتك محمية" : "Tes données sont protégées",
      text: isAr
        ? "نستخدم تشفير Firebase ونظام مصادقة آمن. لا يمكن لأي شخص آخر الوصول إلى بياناتك."
        : "Nous utilisons le chiffrement Firebase et un système d'authentification sécurisé. Personne d'autre ne peut accéder à tes données.",
    },
    {
      icon: Eye,
      title: isAr ? "لا نشارك بياناتك" : "Nous ne partageons jamais tes données",
      text: isAr
        ? "لا نبيع ولا نشارك معلوماتك مع أي طرف ثالث. بياناتك ملك لك وحدك."
        : "Nous ne vendons ni ne partageons tes informations avec des tiers. Tes données t'appartiennent.",
    },
    {
      icon: Server,
      title: isAr ? "التخزين السحابي" : "Stockage cloud",
      text: isAr
        ? "تُخزن بياناتك على خوادم Google Firebase في أوروبا. يمكنك حذف حسابك في أي وقت."
        : "Tes données sont stockées sur les serveurs Google Firebase en Europe. Tu peux supprimer ton compte à tout moment.",
    },
    {
      icon: Shield,
      title: isAr ? "الذكاء الاصطناعي" : "Intelligence artificielle",
      text: isAr
        ? "عند استخدام المساعد الذكي، تُرسل بيانات سيارتك إلى Google Gemini لتحليلها. لا يتم تخزينها."
        : "Lorsque tu utilises l'assistant IA, les données de ton véhicule sont envoyées à Google Gemini pour analyse. Elles ne sont pas conservées.",
    },
    {
      icon: Trash2,
      title: isAr ? "حذف حسابك" : "Suppression de ton compte",
      text: isAr
        ? "يمكنك حذف حسابك وكل بياناتك نهائياً. تواصل معنا عبر واتساب."
        : "Tu peux supprimer ton compte et toutes tes données définitivement. Contacte-nous sur WhatsApp.",
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: isAr ? "الخصوصية والأمان" : "Confidentialité & sécurité",
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
          <View style={{ backgroundColor: "#0891b2", borderRadius: 20, padding: 20, marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, padding: 10 }}>
                <Shield color="#fff" size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                  {isAr ? "خصوصيتك مهمة" : "Ta vie privée compte"}
                </Text>
                <Text style={{ color: "#cffafe", fontSize: 13, marginTop: 2 }}>
                  {isAr ? "التزامنا بحماية بياناتك" : "Notre engagement à protéger tes données"}
                </Text>
              </View>
            </View>
          </View>

          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <View
                key={i}
                style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Icon color="#0891b2" size={20} />
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", flex: 1 }}>
                    {s.title}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: "#475569", lineHeight: 20 }}>
                  {s.text}
                </Text>
              </View>
            );
          })}

          <Text style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 16 }}>
            {isAr ? "آخر تحديث: يناير 2026" : "Dernière mise à jour : Janvier 2026"}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
