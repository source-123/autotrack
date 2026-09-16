import { View, Text, TextInput, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { loginUser, translateAuthError } from "../../lib/auth";
import { useTranslation } from "../../lib/useTranslation";
import { validateEmail, validatePassword } from "../../lib/validation";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

export default function LoginScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const handleLogin = async () => {
    setTouched({ email: true, password: true });

    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);

    if (emailErr || pwdErr) {
      setErrors({ email: emailErr || undefined, password: pwdErr || undefined });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await loginUser(email.trim().toLowerCase(), password);
      // Le layout racine gère la redirection
    } catch (e: any) {
      const code = e?.code || "";
      setErrors({ global: translateAuthError(code) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + Titre */}
        <View className="items-center mb-8">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 260, height: 140 }}
            contentFit="contain"
          />
          <Text className="text-slate-900 dark:text-white text-2xl font-bold mt-2">
            {isAr ? "مرحباً بعودتك" : "Bon retour !"}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isAr ? "سجّل الدخول للمتابعة" : "Connecte-toi pour continuer"}
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 gap-4 shadow-sm">
          {/* Bouton Google */}
          <GoogleSignInButton />

          {/* Séparateur "OU" */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <Text className="text-xs text-slate-400 font-semibold">
              {isAr ? "أو" : "OU"}
            </Text>
            <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </View>

          {/* Erreur globale */}
          {errors.global && (
            <View className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 flex-row items-center gap-2">
              <AlertCircle color="#ef4444" size={20} />
              <Text className="text-red-700 dark:text-red-300 text-sm flex-1">
                {errors.global}
              </Text>
            </View>
          )}

          {/* Email */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("email")}
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 ${
                emailError ? "border-red-400" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <Mail color="#94a3b8" size={18} />
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined, global: undefined }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
            {emailError && (
              <Text className="text-xs text-red-500 mt-0.5">{emailError}</Text>
            )}
          </View>

          {/* Password */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("password")}
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 ${
                passwordError ? "border-red-400" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <Lock color="#94a3b8" size={18} />
              <TextInput
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined, global: undefined }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
                style={{ padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff color="#64748b" size={20} />
                ) : (
                  <Eye color="#64748b" size={20} />
                )}
              </Pressable>
            </View>
            {passwordError && (
              <Text className="text-xs text-red-500 mt-0.5">{passwordError}</Text>
            )}
          </View>

          {/* Mot de passe oublié */}
          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            style={{ alignSelf: isAr ? "flex-start" : "flex-end" }}
          >
            <Text className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              {isAr ? "نسيت كلمة المرور؟" : "Mot de passe oublié ?"}
            </Text>
          </Pressable>

          {/* Bouton Login */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`rounded-xl py-4 mt-2 ${
              loading ? "bg-blue-300 dark:bg-blue-800" : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading
                ? (isAr ? "جارٍ الاتصال..." : "Connexion...")
                : t("loginButton")}
            </Text>
          </Pressable>

          {/* Créer un compte */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              {t("noAccount")}{" "}
            </Text>
            <Link href="/(auth)/register" className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              {t("createAccount")}
            </Link>
          </View>
        </View>

        {/* Footer version */}
        <Text className="text-xs text-slate-400 text-center mt-6">
          Car Autotrack v1.3.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
