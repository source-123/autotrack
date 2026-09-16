import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { ArrowLeft, Bell, Globe, DollarSign, Check } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { useNotificationPrefs } from "../../lib/notificationPrefs";
import { useTranslation } from "../../lib/useTranslation";
import { CURRENCIES } from "../../lib/utils";

export default function SettingsScreen() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const { prefs, updatePrefs, toggleDay } = useNotificationPrefs();

  return (
    <>
      <Stack.Screen
        options={{
          title: isAr ? "الإعدادات" : "Paramètres",
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
        <View className="p-4 gap-4">
          {/* Notifications */}
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <View className="flex-row items-center gap-2 mb-3">
              <Bell color="#f59e0b" size={20} />
              <Text className="text-slate-900 dark:text-white font-bold">
                {isAr ? "الإشعارات" : "Notifications"}
              </Text>
            </View>

            <ToggleRow
              label={isAr ? "تفعيل الإشعارات" : "Activer les notifications"}
              value={prefs.enabled}
              onToggle={() => updatePrefs({ enabled: !prefs.enabled })}
            />

            {prefs.enabled && (
              <>
                <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mt-4 mb-2">
                  {isAr ? "تذكيري قبل" : "Me rappeler avant l'échéance"}
                </Text>
                <ToggleRow label={isAr ? "30 يوماً قبل" : "30 jours avant"} value={prefs.daysBefore.d30} onToggle={() => toggleDay("d30")} />
                <ToggleRow label={isAr ? "7 أيام قبل" : "7 jours avant"} value={prefs.daysBefore.d7} onToggle={() => toggleDay("d7")} />
                <ToggleRow label={isAr ? "يوم واحد قبل" : "1 jour avant"} value={prefs.daysBefore.d1} onToggle={() => toggleDay("d1")} />
                <ToggleRow
                  label={isAr ? "تذكيرات الكيلومترات" : "Rappels par kilométrage"}
                  value={prefs.mileageReminders}
                  onToggle={() => updatePrefs({ mileageReminders: !prefs.mileageReminders })}
                />
              </>
            )}
          </View>

          {/* Langue */}
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <View className="flex-row items-center gap-2 mb-3">
              <Globe color="#8b5cf6" size={20} />
              <Text className="text-slate-900 dark:text-white font-bold">
                {isAr ? "اللغة" : "Langue"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setLanguage("fr")}
                className={`flex-1 py-3 rounded-xl border ${
                  language === "fr" ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                }`}
              >
                <Text className={`text-center font-semibold ${language === "fr" ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>
                  🇫🇷 Français
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLanguage("ar")}
                className={`flex-1 py-3 rounded-xl border ${
                  language === "ar" ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                }`}
              >
                <Text className={`text-center font-semibold ${language === "ar" ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>
                  🇹🇳 العربية
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Devise */}
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <View className="flex-row items-center gap-2 mb-3">
              <DollarSign color="#10b981" size={20} />
              <Text className="text-slate-900 dark:text-white font-bold">
                {isAr ? "العملة" : "Devise"}
              </Text>
            </View>
            {CURRENCIES.map((c) => {
              const active = currency === c.code;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => setCurrency(c.code)}
                  className={`flex-row items-center justify-between py-3 px-3 rounded-xl mb-1 ${
                    active ? "bg-blue-50 dark:bg-blue-950" : "active:bg-slate-50 dark:active:bg-slate-700"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="bg-slate-100 dark:bg-slate-700 rounded-lg w-10 h-10 items-center justify-center">
                      <Text className="font-bold text-slate-700 dark:text-slate-200 text-sm">{c.symbol}</Text>
                    </View>
                    <View>
                      <Text className="text-slate-900 dark:text-white font-semibold">{c.code}</Text>
                      <Text className="text-slate-500 dark:text-slate-400 text-xs">{c.label}</Text>
                    </View>
                  </View>
                  {active && <Check color="#3b82f6" size={20} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
    >
      <Text className="text-slate-700 dark:text-slate-300 text-sm flex-1">{label}</Text>
      <View
        className={`w-12 h-7 rounded-full ${
          value ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
        } justify-center px-0.5`}
      >
        <View className={`w-6 h-6 rounded-full bg-white ${value ? "self-end" : "self-start"}`} />
      </View>
    </Pressable>
  );
}
