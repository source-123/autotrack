import { useEffect } from "react";
import { Platform } from "react-native";
import { useStore } from "./store";
import { useAuthStore } from "./authStore";
import { useNotificationPrefs } from "./notificationPrefs";

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);
  const language = useStore((s) => s.language);
  const prefs = useNotificationPrefs((s) => s.prefs);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const { requestPermission, rescheduleAll } = await import("./notifications");
        await requestPermission().catch(() => {});
        if (cancelled) return;
        await rescheduleAll(vehicles, maintenances, insurances, inspections, prefs, language).catch(() => {});
      } catch (e) {}
    })();

    return () => { cancelled = true; };
  }, [user, vehicles, maintenances, insurances, inspections, prefs, language]);
}
