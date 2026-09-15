import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Mail, Lock } from "lucide-react-native";
import { loginUser, translateAuthError } from "../../lib/auth";
import { useTranslation } from "../../lib/useTranslation";
import { Button } from "../../components/ui/Button";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t("missingFields"), "");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert(t("loginFailed"), translateAuthError(e?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center p-6">
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 300, height: 160 }}
            contentFit="contain"
          />
        </View>

        <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 gap-4">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">{t("login")}</Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("email")}
            </Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <Mail color="#94a3b8" size={18} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("password")}
            </Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <Lock color="#94a3b8" size={18} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                className="flex-1 py-3 px-2 text-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <Button
            title={loading ? t("saving") : t("loginButton")}
            onPress={handleLogin}
            loading={loading}
            size="lg"
          />

          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">{t("noAccount")} </Text>
            <Link href="/(auth)/register" className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              {t("createAccount")}
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
