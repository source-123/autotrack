import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { Car, Mail, Lock, User } from "lucide-react-native";
import { registerUser, translateAuthError } from "../../lib/auth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Champs manquants", "Tous les champs sont obligatoires.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Mot de passe faible", "Minimum 6 caractères.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Mots de passe différents", "Les deux mots de passe doivent être identiques.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(email.trim(), password, name.trim());
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Inscription échouée", translateAuthError(e?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-50" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center p-6">
        <View className="items-center mb-8">
          <View className="bg-blue-500 rounded-3xl p-5 mb-4">
            <Car color="#fff" size={48} />
          </View>
          <Text className="text-3xl font-bold text-zinc-900">AutoTrack</Text>
          <Text className="text-zinc-500 mt-1">Créez votre compte</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 border border-zinc-200 gap-4">
          <Text className="text-xl font-bold text-zinc-900">Inscription</Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-zinc-700">Nom complet</Text>
            <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3">
              <User color="#a1a1aa" size={18} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jean Dupont"
                className="flex-1 py-3 px-2 text-zinc-900"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-zinc-700">Email</Text>
            <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3">
              <Mail color="#a1a1aa" size={18} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-3 px-2 text-zinc-900"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-zinc-700">Mot de passe</Text>
            <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3">
              <Lock color="#a1a1aa" size={18} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="•••••••• (min 6)"
                secureTextEntry
                className="flex-1 py-3 px-2 text-zinc-900"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-zinc-700">Confirmer</Text>
            <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3">
              <Lock color="#a1a1aa" size={18} />
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••••"
                secureTextEntry
                className="flex-1 py-3 px-2 text-zinc-900"
              />
            </View>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className={`rounded-xl py-4 mt-2 ${loading ? "bg-blue-300" : "bg-blue-500 active:bg-blue-600"}`}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading ? "Création..." : "Créer mon compte"}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-2">
            <Text className="text-zinc-500 text-sm">Déjà un compte ? </Text>
            <Link href="/(auth)/login" className="text-blue-500 text-sm font-semibold">
              Se connecter
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
