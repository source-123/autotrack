import { Tabs } from "expo-router";
import { Home, Car, Bell, Sparkles, Menu } from "lucide-react-native";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useTranslation } from "../../lib/useTranslation";
import { useSidebar } from "../../lib/sidebarStore";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { t } = useTranslation();
  const openSidebar = useSidebar((s) => s.open);

  const bottomPadding = Platform.OS === "web" ? 8 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  const HamburgerButton = () => (
    <Pressable onPress={openSidebar} className="ml-3 p-2">
      <Menu color={isDark ? "#fff" : "#0f172a"} size={24} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerLeft: () => <HamburgerButton />,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#94a3b8",
        headerStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
        headerTitleStyle: { fontWeight: "bold", color: isDark ? "#ffffff" : "#0f172a" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: bottomPadding + 4,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      {/* ===== TABS VISIBLES (4) ===== */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: t("tabVehicles"),
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t("tabAssistant"),
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t("tabReminders"),
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />

      {/* ===== TABS CACHÉS (accessibles via sidebar) ===== */}
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
          title: t("tabStats"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: t("tabProfile"),
        }}
      />
    </Tabs>
  );
}
