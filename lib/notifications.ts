import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import dayjs from "dayjs";
import { Vehicle, Maintenance, Insurance, Inspection } from "../types";
import { NotificationPrefs } from "./notificationPrefs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Crée le canal de notification pour Android 8+.
 * Sans ce canal, les notifications ne s'affichent PAS.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Rappels AutoTrack",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
    console.log("✅ Canal Android créé");
  } catch (e) {
    console.warn("❌ Erreur création canal:", e);
  }
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;
    const perm = await (window as any).Notification.requestPermission();
    return perm === "granted";
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    await ensureAndroidChannel();
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === "granted") {
    await ensureAndroidChannel();
  }
  return status === "granted";
}

export async function cancelAll() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleAt(date: Date, title: string, body: string, id: string) {
  if (date.getTime() <= Date.now()) return;
  if (Platform.OS === "web") {
    const ms = date.getTime() - Date.now();
    if (ms < 2147483647) {
      setTimeout(() => {
        new (window as any).Notification(title, { body });
      }, ms);
    }
    return;
  }
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.MAX,
      ...(Platform.OS === "android" ? { channelId: "default" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      ...(Platform.OS === "android" ? { channelId: "default" } : {}),
    },
  });
}

type Lang = "fr" | "ar";

const STRINGS: Record<Lang, Record<string, string>> = {
  fr: {
    inspectionTitle: "🔴 Visite technique",
    inspectionBody: "{label} — expire dans {d} jour(s)",
    insuranceTitle: "🛡️ Assurance",
    insuranceBody: "{label} — {company} expire dans {d} jour(s)",
    maintenanceTitle: "🔧 Entretien à prévoir",
    maintenanceBody: "{label} — {type} dans {d} jour(s)",
  },
  ar: {
    inspectionTitle: "🔴 الفحص الفني",
    inspectionBody: "{label} — ينتهي في {d} يوم",
    insuranceTitle: "🛡️ التأمين",
    insuranceBody: "{label} — {company} ينتهي في {d} يوم",
    maintenanceTitle: "🔧 صيانة قادمة",
    maintenanceBody: "{label} — {type} بعد {d} يوم",
  },
};

function t(lang: Lang, key: string, vars: Record<string, any> = {}): string {
  let s = STRINGS[lang][key] || key;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  }
  return s;
}

export async function rescheduleAll(
  vehicles: Vehicle[],
  maintenances: Maintenance[],
  insurances: Insurance[],
  inspections: Inspection[],
  prefs: NotificationPrefs,
  language: Lang = "fr"
) {
  await cancelAll();
  if (!prefs.enabled) return;

  const now = Date.now();
  const daysToSchedule: number[] = [];
  if (prefs.daysBefore.d30) daysToSchedule.push(30);
  if (prefs.daysBefore.d7) daysToSchedule.push(7);
  if (prefs.daysBefore.d1) daysToSchedule.push(1);

  for (const v of vehicles) {
    const label = `${v.brand} ${v.model} (${v.plate})`;

    // Visite technique
    const latestVT = inspections
      .filter((i) => i.vehicleId === v.id)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate))[0];
    if (latestVT) {
      for (const days of daysToSchedule) {
        const d = dayjs(latestVT.expiryDate).subtract(days, "day").toDate();
        if (d.getTime() > now) {
          await scheduleAt(
            d,
            t(language, "inspectionTitle"),
            t(language, "inspectionBody", { label, d: days }),
            `vt-${v.id}-${days}`
          );
        }
      }
    }

    // Assurance
    const latestIns = insurances
      .filter((i) => i.vehicleId === v.id)
      .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
    if (latestIns) {
      for (const days of daysToSchedule) {
        const d = dayjs(latestIns.endDate).subtract(days, "day").toDate();
        if (d.getTime() > now) {
          await scheduleAt(
            d,
            t(language, "insuranceTitle"),
            t(language, "insuranceBody", { label, company: latestIns.company, d: days }),
            `ins-${v.id}-${days}`
          );
        }
      }
    }

    // Entretiens par date
    for (const m of maintenances.filter((x) => x.vehicleId === v.id)) {
      if (!m.nextDueDate) continue;
      for (const days of daysToSchedule) {
        const d = dayjs(m.nextDueDate).subtract(days, "day").toDate();
        if (d.getTime() > now) {
          await scheduleAt(
            d,
            t(language, "maintenanceTitle"),
            t(language, "maintenanceBody", { label, type: m.type.replace("_", " "), d: days }),
            `maint-${m.id}-${days}`
          );
        }
      }
    }
  }
}
