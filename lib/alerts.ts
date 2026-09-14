import dayjs from "dayjs";
import {
  Vehicle, Maintenance, Insurance, Inspection, Reminder,
} from "../types";
import { statusFromDate, daysUntil } from "./utils";

export type Alert = {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  type: "inspection" | "insurance" | "maintenance" | "reminder";
  title: string;
  detail: string;
  dueDate?: string;
  dueMileage?: number;
  daysLeft?: number;
  severity: "urgent" | "soon" | "info";
};

export function computeAlerts(
  vehicles: Vehicle[],
  maintenances: Maintenance[],
  insurances: Insurance[],
  inspections: Inspection[],
  reminders: Reminder[]
): Alert[] {
  const alerts: Alert[] = [];

  for (const v of vehicles) {
    const label = `${v.brand} ${v.model} (${v.plate})`;

    // --- Visite technique ---
    const vInspections = inspections
      .filter((i) => i.vehicleId === v.id)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate));
    if (vInspections[0]) {
      const latest = vInspections[0];
      const days = daysUntil(latest.expiryDate);
      const sev = statusFromDate(latest.expiryDate);
      if (sev !== "ok" || (days !== null && days < 60)) {
        alerts.push({
          id: `vt-${v.id}`,
          vehicleId: v.id,
          vehicleLabel: label,
          type: "inspection",
          title: "Visite technique",
          detail:
            days !== null && days < 0
              ? `Expirée depuis ${Math.abs(days)} jours`
              : `Expire dans ${days} jours`,
          dueDate: latest.expiryDate,
          daysLeft: days ?? undefined,
          severity: sev === "expired" ? "urgent" : sev === "soon" ? "soon" : "info",
        });
      }
    }

    // --- Assurance ---
    const vInsurances = insurances
      .filter((i) => i.vehicleId === v.id)
      .sort((a, b) => b.endDate.localeCompare(a.endDate));
    if (vInsurances[0]) {
      const latest = vInsurances[0];
      const days = daysUntil(latest.endDate);
      const sev = statusFromDate(latest.endDate);
      if (sev !== "ok" || (days !== null && days < 60)) {
        alerts.push({
          id: `ins-${v.id}`,
          vehicleId: v.id,
          vehicleLabel: label,
          type: "insurance",
          title: `Assurance ${latest.company}`,
          detail:
            days !== null && days < 0
              ? `Expirée depuis ${Math.abs(days)} jours`
              : `Expire dans ${days} jours`,
          dueDate: latest.endDate,
          daysLeft: days ?? undefined,
          severity: sev === "expired" ? "urgent" : sev === "soon" ? "soon" : "info",
        });
      }
    }

    // --- Entretiens (prochaine échéance) ---
    const vMaint = maintenances.filter((m) => m.vehicleId === v.id);
    for (const m of vMaint) {
      // Alerte par km
      if (m.nextDueMileage && m.nextDueMileage > 0) {
        const remaining = m.nextDueMileage - v.mileage;
        if (remaining <= 2000) {
          alerts.push({
            id: `maint-km-${m.id}`,
            vehicleId: v.id,
            vehicleLabel: label,
            type: "maintenance",
            title: `Prochain ${m.type.replace("_", " ")}`,
            detail:
              remaining <= 0
                ? `Dépassé de ${Math.abs(remaining).toLocaleString("fr-FR")} km`
                : `Dans ${remaining.toLocaleString("fr-FR")} km`,
            dueMileage: m.nextDueMileage,
            severity: remaining <= 0 ? "urgent" : "soon",
          });
        }
      }
      // Alerte par date
      if (m.nextDueDate) {
        const days = daysUntil(m.nextDueDate);
        const sev = statusFromDate(m.nextDueDate);
        if (sev !== "ok") {
          alerts.push({
            id: `maint-date-${m.id}`,
            vehicleId: v.id,
            vehicleLabel: label,
            type: "maintenance",
            title: `Prochain ${m.type.replace("_", " ")}`,
            detail:
              days !== null && days < 0
                ? `Dépassé de ${Math.abs(days)} jours`
                : `Dans ${days} jours`,
            dueDate: m.nextDueDate,
            daysLeft: days ?? undefined,
            severity: sev === "expired" ? "urgent" : "soon",
          });
        }
      }
    }

    // --- Rappels manuels ---
    for (const r of reminders.filter((x) => x.vehicleId === v.id && !x.notified)) {
      if (r.dueDate) {
        const days = daysUntil(r.dueDate);
        const sev = statusFromDate(r.dueDate);
        if (sev !== "ok") {
          alerts.push({
            id: `rem-${r.id}`,
            vehicleId: v.id,
            vehicleLabel: label,
            type: "reminder",
            title: r.title,
            detail:
              days !== null && days < 0
                ? `Dépassé de ${Math.abs(days)} jours`
                : `Dans ${days} jours`,
            dueDate: r.dueDate,
            daysLeft: days ?? undefined,
            severity: sev === "expired" ? "urgent" : "soon",
          });
        }
      }
    }
  }

  // Trier : urgent → soon → info
  const order = { urgent: 0, soon: 1, info: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}
