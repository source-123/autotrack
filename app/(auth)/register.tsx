import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Check } from "lucide-react-native";
import { registerUser, translateAuthError } from "../../lib/auth";
import { useTranslation } from "../../lib/useTranslation";
import { validateEmail, validatePassword, validateName, validatePasswordConfirm } from "../../lib/validation";

export default function RegisterScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string; global?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean; confirm?: boolean }>({});

  const nameError = touched.name ? validateName(name) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;
  const confirmError = touched.confirm ? validatePasswordConfirm(password, confirm) : null;

  const handleRegister = async () => {
    setTouched({ name: true, email: true, password: true, confirm: true });

    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validatePasswordConfirm(password, confirm);

    if (nErr || eErr || pErr || cErr) {
      setErrors({
        name: nErr || undefined,
        email: eErr || undefined,
        password: pErr || undefined,
        confirm: cErr || undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await registerUser(email.trim().toLowerCase(), password, name.trim());
    } catch (e: any) {
      setErrors({ global: translateAuthError(e?.code || "") });
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
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 220, height: 120 }}
            contentFit="contain"
          />
          <Text className="text-slate-900 dark:text-white text-2xl font-bold mt-2">
            {isAr ? "إنشاء حساب جديد" : "Créer un compte"}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isAr ? "انضم إلينا في دقيقة واحدة" : "Rejoins-nous en 1 minute"}
          </Text>
        </View>

        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 gap-4">
          {errors.global ? (
            <View className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 flex-row items-center gap-2">
              <AlertCircle color="#ef4444" size={20} />
              <Text className="text-red-700 dark:text-red-300 text-sm flex-1">
                {errors.global}
              </Text>
            </View>
          ) : null}

          {/* Nom */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("fullName")}
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 ${
                nameError ? "border-red-400" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <User color="#94a3b8" size={18} />
              <TextInput
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  if (errors.name) setErrors((e) => ({ ...e, name: undefined, global: undefined }));
                }}
                onBlur={() => setTouched((tt) => ({ ...tt, name: true }))}
                placeholder="Jean Dupont"
                autoCapitalize="words"
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
            {nameError ? (
              <Text className="text-xs text-red-500 mt-0.5">{nameError}</Text>
            ) : null}
          </View>

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
                onBlur={() => setTouched((tt) => ({ ...tt, email: true }))}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
            {emailError ? (
              <Text className="text-xs text-red-500 mt-0.5">{emailError}</Text>
            ) : null}
          </View>

          {/* Mot de passe */}
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
                onBlur={() => setTouched((tt) => ({ ...tt, password: true }))}
                placeholder={isAr ? "•••••••• (6 أحرف على الأقل)" : "•••••••• (min 6)"}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10} style={{ padding: 4 }}>
                {showPassword ? (
                  <EyeOff color="#64748b" size={20} />
                ) : (
                  <Eye color="#64748b" size={20} />
                )}
              </Pressable>
            </View>
            {passwordError ? (
              <Text className="text-xs text-red-500 mt-0.5">{passwordError}</Text>
            ) : null}

            {/* Indicateur de force */}
            {password.length > 0 ? (
              <View className="flex-row gap-1 mt-1">
                {[1, 2, 3].map((i) => {
                  const strength = password.length >= 10 ? 3 : password.length >= 6 ? 2 : 1;
                  let barColor = "bg-slate-200 dark:bg-slate-700";
                  if (i <= strength) {
                    barColor = strength === 3 ? "bg-emerald-500" : strength === 2 ? "bg-amber-500" : "bg-red-500";
                  }
                  return <View key={i} className={`h-1 flex-1 rounded-full ${barColor}`} />;
                })}
              </View>
            ) : null}
          </View>

          {/* Confirmer */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("confirmPassword")}
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 ${
                confirmError
                  ? "border-red-400"
                  : confirm && password === confirm
                  ? "border-emerald-400"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <Lock color="#94a3b8" size={18} />
              <TextInput
                value={confirm}
                onChangeText={(v) => {
                  setConfirm(v);
                  if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined, global: undefined }));
                }}
                onBlur={() => setTouched((tt) => ({ ...tt, confirm: true }))}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
                onSubmitEditing={handleRegister}
              />
              {confirm && password === confirm ? (
                <Check color="#10b981" size={20} />
              ) : null}
            </View>
            {confirmError ? (
              <Text className="text-xs text-red-500 mt-0.5">{confirmError}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className={`rounded-xl py-4 mt-2 ${
              loading ? "bg-blue-300 dark:bg-blue-800" : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading
                ? isAr
                  ? "جارٍ الإنشاء..."
                  : "Création..."
                : t("registerButton")}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              {t("haveAccount")}{" "}
            </Text>
            <Link href="/(auth)/login" className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              {t("loginButton")}
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
