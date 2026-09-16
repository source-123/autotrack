import { View, Text, Pressable, ScrollView, Modal, Platform, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { router, usePathname } from "expo-router";
import { Image } from "expo-image";
import {
  X, Home, Car, Bell, Sparkles, BarChart3, User, Settings,
  Globe, DollarSign, HelpCircle, LogOut, FileText, Calendar,
} from "lucide-react-native";
import { useSidebar } from "../lib/sidebarStore";
import { useTranslation } from "../lib/useTranslation";
import { useAuthStore } from "../lib/authStore";
import { logoutUser } from "../lib/auth";
import { useStore } from "../lib/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

const COLORS = {
  blue: "#2563eb",
  white: "#ffffff",
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  blueLight: "#eff6ff",
  blueDark: "#1e3a8a",
  red: "#ef4444",
  redLight: "#fef2f2",
};

type MenuItem = {
  key: string;
  label: string;
  icon: any;
  route: string;
  color?: string;
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

export function Sidebar() {
  const { t, lang } = useTranslation();
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const vehicles = useStore((s) => s.vehicles);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const sections: MenuSection[] = [
    {
      items: [
        { key: "home", label: t("tabHome"), icon: Home, route: "/(tabs)" },
        { key: "vehicles", label: t("tabVehicles"), icon: Car, route: "/(tabs)/vehicles" },
        { key: "assistant", label: t("tabAssistant"), icon: Sparkles, route: "/(tabs)/assistant", color: "#8b5cf6" },
        { key: "reminders", label: t("tabReminders"), icon: Bell, route: "/(tabs)/reminders" },
      ],
    },
    {
      title: lang === "ar" ? "التحليل" : "Analyse",
      items: [
        { key: "stats", label: t("tabStats"), icon: BarChart3, route: "/(tabs)/stats" },
      ],
    },
    {
      title: lang === "ar" ? "المكتبة" : "Bibliothèque",
      items: [
        { key: "documents", label: lang === "ar" ? "المستندات" : "Documents", icon: FileText, route: "/(tabs)/vehicles" },
        { key: "history", label: lang === "ar" ? "السجل" : "Historique", icon: Calendar, route: "/(tabs)/vehicles" },
      ],
    },
    {
      title: lang === "ar" ? "الحساب" : "Compte",
      items: [
        { key: "profile", label: t("tabProfile"), icon: User, route: "/(tabs)/profile" },
        { key: "settings", label: t("settings"), icon: Settings, route: "/(tabs)/profile" },
      ],
    },
    {
      items: [
        { key: "help", label: t("helpGuide"), icon: HelpCircle, route: "/onboarding/calculations" },
      ],
    },
  ];

  const handleNavigate = (route: string) => {
    close();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handleLogout = async () => {
    close();
    if (Platform.OS === "web") {
      if (window.confirm(t("logoutConfirm") + "\n\n" + t("logoutMessage"))) {
        await logoutUser();
      }
    } else {
      const { Alert } = require("react-native");
      Alert.alert(t("logoutConfirm"), t("logoutMessage"), [
        { text: t("cancel"), style: "cancel" },
        { text: t("logoutButton"), style: "destructive", onPress: () => logoutUser() },
      ]);
    }
  };

  const isActive = (route: string) => {
    if (route === "/(tabs)" && (pathname === "/" || pathname === "/(tabs)")) return true;
    if (route !== "/(tabs)" && pathname.startsWith(route.replace("/(tabs)", ""))) return true;
    return false;
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={close}>
      <View style={{ flex: 1 }}>
        {/* Overlay sombre */}
        <Pressable
          onPress={close}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
          }}
        />

        {/* Sidebar */}
        <Animated.View
          style={{
            width: SIDEBAR_WIDTH,
            transform: [{ translateX: slideAnim }],
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            backgroundColor: COLORS.white,
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: COLORS.blue,
              paddingTop: Platform.OS === "web" ? 24 : 56,
              paddingBottom: 20,
              paddingHorizontal: 20,
              borderBottomRightRadius: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Image
                  source={require("../assets/logo.png")}
                  style={{ width: 140, height: 50 }}
                  contentFit="contain"
                />
              </View>
              <Pressable
                onPress={close}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 999,
                  padding: 8,
                }}
              >
                <X color="#fff" size={20} />
              </Pressable>
            </View>

            {/* User info */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, padding: 10 }}>
                <User color="#fff" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }} numberOfLines={1}>
                  {user?.displayName || "Utilisateur"}
                </Text>
                <Text style={{ color: "#bfdbfe", fontSize: 12 }} numberOfLines={1}>
                  {user?.email || ""}
                </Text>
              </View>
            </View>

            {/* Mini stats */}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flex: 1 }}>
                <Text style={{ color: "#bfdbfe", fontSize: 11 }}>{t("vehicles")}</Text>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{vehicles.length}</Text>
              </View>
            </View>
          </View>

          {/* Menu items */}
          <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }} contentContainerStyle={{ paddingVertical: 12 }}>
            {sections.map((section, si) => (
              <View key={si} style={{ marginBottom: 8 }}>
                {section.title && (
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: COLORS.slate400, textTransform: "uppercase", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
                    {section.title}
                  </Text>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.route);
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => handleNavigate(item.route)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        marginHorizontal: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: active ? COLORS.blueLight : "transparent",
                      }}
                    >
                      <Icon color={active ? COLORS.blue : item.color || COLORS.slate500} size={22} />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: active ? COLORS.blue : COLORS.slate700,
                          fontWeight: active ? "600" : "400",
                        }}
                      >
                        {item.label}
                      </Text>
                      {active && <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: COLORS.blue }} />}
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Logout */}
            <View style={{ marginTop: 12, marginHorizontal: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.slate200 }}>
              <Pressable
                onPress={handleLogout}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <LogOut color={COLORS.red} size={22} />
                <Text style={{ color: COLORS.red, fontWeight: "600", fontSize: 15 }}>
                  {t("logout")}
                </Text>
              </Pressable>
            </View>

            {/* Version */}
            <Text style={{ fontSize: 11, color: COLORS.slate400, textAlign: "center", marginTop: 16, marginBottom: 24 }}>
              Car Autotrack v1.3.0
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
