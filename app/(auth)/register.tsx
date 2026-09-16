import { View, Text, TextInput, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Mail, Lock, User } from "lucide-react-native";
import { registerUser, translateAuthError } from "../../lib/auth";
import { useTranslation } from "../../lib/useTranslation";
import { Button } from "../../components/ui/Button";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(t("missingFields"), "");
      return;
    }
    if (password.length < 6) {
      Alert.alert(t("weakPassword"));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t("passwordsDontMatch"));
      return;
    }
    setLoading(true);
    try {
      await registerUser(email.trim(), password, name.trim());
      // Le layout racine va gérer la redirection automatiquement
    } catch (e: any) {
      Alert.alert(t("registerFailed"), translateAuthError(e?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center p-6">
        <View className="items-center mb-4">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 260, height: 140 }}
            contentFit="contain"
          />
        </View>

        <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 gap-4">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">{t("register")}</Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("fullName")}</Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <User color="#94a3b8" size={18} />
              <TextInput
                value={name}
                onChangeText={setName}
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("email")}</Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <Mail color="#94a3b8" size={18} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("password")}</Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <Lock color="#94a3b8" size={18} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("confirmPassword")}</Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <Lock color="#94a3b8" size={18} />
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <Button
            title={loading ? t("saving") : t("registerButton")}
            onPress={handleRegister}
            loading={loading}
            size="lg"
          />

          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">{t("haveAccount")} </Text>
            <Link href="/(auth)/login" className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              {t("loginButton")}
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
