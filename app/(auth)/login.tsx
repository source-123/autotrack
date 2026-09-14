import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Mail, Lock } from "lucide-react-native";
import { loginUser, translateAuthError } from "../../lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Champs manquants", "Email et mot de passe sont requis.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Connexion échouée", translateAuthError(e?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center p-6">
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 300, height: 160 }}
            contentFit="contain"
          />
        </View>

        <View className="bg-white rounded-2xl p-5 border border-slate-200 gap-4">
          <Text className="text-xl font-bold text-slate-900">Connexion</Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700">Email</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <Mail color="#94a3b8" size={18} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-3 px-2 text-slate-900"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-700">Mot de passe</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <Lock color="#94a3b8" size={18} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                className="flex-1 py-3 px-2 text-slate-900"
              />
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`rounded-xl py-4 mt-2 ${loading ? "bg-blue-300" : "bg-blue-600 active:bg-blue-700"}`}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading ? "Connexion..." : "Se connecter"}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-500 text-sm">Pas de compte ? </Text>
            <Link href="/(auth)/register" className="text-blue-600 text-sm font-semibold">
              Créer un compte
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
