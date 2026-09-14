import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import dayjs from "dayjs";
import { Vehicle, Maintenance, Insurance, Inspection } from "../types";

// Config globale : comment afficher les notifs quand l'app est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Demander la permission (à appeler au premier lancement) */
export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    // Web : utilise l'API Notification
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;
    const perm = await (window as any).Notification.requestPermission();
    return perm === "granted";
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Annuler toutes les notifications programmées */
export async function cancelAll() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Programme une notification à une date donnée */
async function scheduleAt(date: Date, title: string, body: string, id: string) {
  if (date.getTime() <= Date.now()) return; // pas dans le futur
  if (Platform.OS === "web") {
    // Sur web, on utilise setTimeout (limité mais fonctionne app ouverte)
    const ms = date.getTime() - Date.now();
    if (ms < 2147483647) {
      setTimeout(() => {
        new (window as any).Notification(title, { body });
      }, ms);
    }
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

/**
 * Recalcule et reprogramme toutes les notifications.
 * À appeler au démarrage et après chaque modification.
 */
export async function rescheduleAll(
  vehicles: Vehicle[],
  maintenances: Maintenance[],
  insurances: Insurance[],
  inspections: Inspection[]
) {
  await cancelAll();

  const now = Date.now();

  for (const v of vehicles) {
    const label = `${v.brand} ${v.model} (${v.plate})`;

    // --- Visite technique : notif 30j et 7j avant expiration ---
    const latestVT = inspections
      .filter((i) => i.vehicleId === v.id)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate))[0];
    if (latestVT) {
      for (const days of [30, 7, 1]) {
        const d = dayjs(latestVT.expiryDate).subtract(days, "day").toDate();
        if (d.getTime() > now) {
          await scheduleAt(
            d,
            "🔴 Visite technique",
            `${label} — expire dans ${days} jour${days > 1 ? "s" : ""}`,
            `vt-${v.id}-${days}`
          );
        }
      }
    }

    // --- Assurance ---
    const latestIns = insurances
      .filter((i) => i.vehicleId === v.id)
      .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
    if (latestIns) {
      for (const days of [30, 7, 1]) {
        const d = dayjs(latestIns.endDate).subtract(days, "day").toDate();
        if (d.getTime() > now) {
          await scheduleAt(
            d,
            "🛡️ Assurance",
            `${label} — ${latestIns.company} expire dans ${days} jour${days > 1 ? "s" : ""}`,
            `ins-${v.id}-${days}`
          );
        }
      }
    }

    // --- Entretiens par date ---
    for (const m of maintenances.filter((x) => x.vehicleId === v.id)) {
      if (!m.nextDueDate) continue;
      for (const days of [14, 3]) {
        const d = dayjs(m.nextDueDate).subtract(days, "day").toDate();
        if (d.getTime() > now) {
          await scheduleAt(
            d,
            "🔧 Entretien à prévoir",
            `${label} — ${m.type.replace("_", " ")} dans ${days} jour${days > 1 ? "s" : ""}`,
            `maint-${m.id}-${days}`
          );
        }
      }
    }
  }
}