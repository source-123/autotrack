import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Stack } from "expo-router";
import { Send, Sparkles, Trash2 } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { useChatStore } from "../../lib/chatStore";
import { useTranslation } from "../../lib/useTranslation";
import { chatWithGemini } from "../../lib/ai";
import { PremiumGate } from "../../components/PremiumGate";
import { buildUserContext, getAssistantPrompt } from "../../lib/aiPrompts";

export default function AssistantScreen() {
  const { t, lang } = useTranslation();
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const fuels = useStore((s) => s.fuels);
  const currency = useStore((s) => s.currency);

  const { messages, addMessage, clear } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const suggestions =
    lang === "ar"
      ? [
          "ما حالة سيارتي؟",
          "متى موعد الصيانة القادمة؟",
          "هل استهلاكي طبيعي؟",
          "ما تكلفة السنة القادمة؟",
        ]
      : [
          "Quel est l'état de ma voiture ?",
          "Quand est mon prochain entretien ?",
          "Ma consommation est-elle normale ?",
          "Combien vais-je dépenser cette année ?",
        ];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    setInput("");
    addMessage({ role: "user", text: userMessage });
    setLoading(true);

    try {
      const userContext = buildUserContext(
        vehicles,
        maintenances,
        insurances,
        inspections,
        fuels,
        currency
      );
      const systemPrompt = getAssistantPrompt(lang as "fr" | "ar", userContext);

      // Historique (5 derniers messages pour contexte)
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await chatWithGemini(systemPrompt, history, userMessage);
      addMessage({ role: "model", text: response });
    } catch (e: any) {
      addMessage({
        role: "model",
        text:
          lang === "ar"
            ? `❌ عذراً، حدث خطأ: ${e?.message || "غير معروف"}`
            : `❌ Désolé, une erreur est survenue : ${e?.message || "inconnue"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const doClear = () => clear();
    if (Platform.OS === "web") {
      if (window.confirm(lang === "ar" ? "مسح كل المحادثة؟" : "Effacer la conversation ?")) {
        doClear();
      }
    } else {
      Alert.alert(
        lang === "ar" ? "مسح المحادثة؟" : "Effacer la conversation ?",
        "",
        [
          { text: lang === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
          { text: lang === "ar" ? "مسح" : "Effacer", style: "destructive", onPress: doClear },
        ]
      );
    }
  };

  return (
    <PremiumGate featureName={lang === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}>
    <>
      <Stack.Screen
        options={{
          title: lang === "ar" ? "المساعد الذكي" : "Assistant IA",
          headerRight: () =>
            messages.length > 0 ? (
              <Pressable onPress={handleClear} className="mr-4">
                <Trash2 color="#ef4444" size={22} />
              </Pressable>
            ) : null,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-slate-50 dark:bg-slate-900"
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View className="items-center justify-center pt-10">
              <View className="bg-blue-100 dark:bg-blue-950 rounded-full p-6 mb-4">
                <Sparkles color="#2563eb" size={48} />
              </View>
              <Text className="text-xl font-bold text-slate-900 dark:text-white text-center">
                {lang === "ar"
                  ? "مرحباً! أنا مساعدك الذكي 🤖"
                  : "Bonjour ! Je suis ton assistant IA 🤖"}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-center mt-2 mb-6 px-6">
                {lang === "ar"
                  ? "اسألني أي شيء عن سيارتك، صيانتها، تكاليفها..."
                  : "Pose-moi n'importe quelle question sur ta voiture, son entretien, ses coûts..."}
              </Text>

              <View className="w-full gap-2 mt-4 px-2">
                {suggestions.map((s, i) => (
                  <Pressable
                    key={i}
                    onPress={() => sendMessage(s)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 active:bg-slate-50 dark:active:bg-slate-700"
                  >
                    <Text className="text-slate-700 dark:text-slate-200 text-sm">
                      💬 {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {loading && (
                <View className="flex-row items-center gap-2 self-start bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    {lang === "ar" ? "أفكر..." : "Je réfléchis..."}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-3 py-2">
          <View className="flex-row items-end gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={lang === "ar" ? "اكتب سؤالك..." : "Pose ta question..."}
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage(input)}
              className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-3 text-slate-900 dark:text-white max-h-24"
              style={{ textAlignVertical: "top" }}
            />
            <Pressable
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                !input.trim() || loading ? "bg-slate-200 dark:bg-slate-700" : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              <Send
                color={!input.trim() || loading ? "#94a3b8" : "#fff"}
                size={20}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
    </PremiumGate>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === "user";
  return (
    <View
      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser
          ? "bg-blue-600 self-end"
          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start"
      }`}
    >
      <Text
        className={`text-sm leading-5 ${
          isUser ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        {message.text}
      </Text>
    </View>
  );
}
