import { Tabs } from "expo-router";
import { Home, Car, Bell, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#71717a",
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontWeight: "bold" },
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#e4e4e7" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Véhicules",
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Rappels",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
