import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react-native";
import { resetPassword, translateAuthError } from "../../lib/auth";
import { useTranslation } from "../../lib/useTranslation";
import { validateEmail } from "../../lib/validation";

export default function ForgotPasswordScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      setError(translateAuthError(e?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center p-6">
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 items-center">
          <View className="bg-emerald-100 dark:bg-emerald-950 rounded-full p-4 mb-4">
            <CheckCircle2 color="#10b981" size={40} />
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white text-center">
            {isAr ? "تم الإرسال!" : "Email envoyé !"}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-center mt-3 text-sm leading-5">
            {isAr
              ? `تحقق من بريدك الإلكتروني ${email} واتبع التعليمات لإعادة تعيين كلمة المرور.`
              : `Vérifie ta boîte mail ${email} et suis les instructions pour réinitialiser ton mot de passe.`}
          </Text>
          <Pressable
            onPress={() => router.replace("/(auth)/login")}
            className="mt-6 bg-blue-600 rounded-xl py-4 px-6"
          >
            <Text className="text-white text-center font-bold">
              {isAr ? "العودة لتسجيل الدخول" : "Retour à la connexion"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-6 self-start"
        >
          <ArrowLeft color="#2563eb" size={22} />
          <Text className="text-blue-600 dark:text-blue-400 font-semibold">
            {isAr ? "رجوع" : "Retour"}
          </Text>
        </Pressable>

        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 gap-5">
          <View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAr ? "نسيت كلمة المرور؟" : "Mot de passe oublié ?"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-5">
              {isAr
                ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
                : "Entre ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe."}
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 flex-row items-center gap-2">
              <AlertCircle color="#ef4444" size={20} />
              <Text className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</Text>
            </View>
          )}

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("email")}
            </Text>
            <View className={`flex-row items-center bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 ${
              error ? "border-red-400" : "border-slate-200 dark:border-slate-700"
            }`}>
              <Mail color="#94a3b8" size={18} />
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); if (error) setError(null); }}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
                onSubmitEditing={handleSend}
              />
            </View>
          </View>

          <Pressable
            onPress={handleSend}
            disabled={loading}
            className={`rounded-xl py-4 ${
              loading ? "bg-blue-300 dark:bg-blue-800" : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading
                ? (isAr ? "جارٍ الإرسال..." : "Envoi...")
                : (isAr ? "إرسال الرابط" : "Envoyer le lien")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
