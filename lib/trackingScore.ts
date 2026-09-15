import dayjs from "dayjs";
import {
  Vehicle, Maintenance, Insurance, Inspection, Fuel,
} from "../types";
import { daysUntil } from "./utils";

export type TrackingScore = {
  score: number;
  label: string;
  color: string;
  breakdown: { label: string; points: number; max: number; status: string }[];
};

/**
 * Calcule un score de suivi (0-100) basé sur la complétude des données.
 * ⚠️ Ce N'EST PAS un diagnostic mécanique.
 */
export function computeTrackingScore(
  vehicle: Vehicle,
  maintenances: Maintenance[],
  insurances: Insurance[],
  inspections: Inspection[],
  fuels: Fuel[]
): TrackingScore {
  const breakdown: { label: string; points: number; max: number; status: string }[] = [];
  let total = 0;

  // 1. Assurance (25 pts)
  const latestIns = insurances
    .filter((i) => i.vehicleId === vehicle.id)
    .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
  let insPts = 0;
  let insStatus = "Aucune assurance";
  if (latestIns) {
    const days = daysUntil(latestIns.endDate) ?? 0;
    if (days < 0) { insPts = 0; insStatus = "Expirée"; }
    else if (days < 30) { insPts = 15; insStatus = `Expire dans ${days}j`; }
    else { insPts = 25; insStatus = "À jour"; }
  }
  breakdown.push({ label: "Assurance", points: insPts, max: 25, status: insStatus });
  total += insPts;

  // 2. Visite technique (25 pts)
  const latestVT = inspections
    .filter((i) => i.vehicleId === vehicle.id)
    .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate))[0];
  let vtPts = 0;
  let vtStatus = "Aucune visite";
  if (latestVT) {
    const days = daysUntil(latestVT.expiryDate) ?? 0;
    if (days < 0) { vtPts = 0; vtStatus = "Expirée"; }
    else if (days < 30) { vtPts = 15; vtStatus = `Expire dans ${days}j`; }
    else { vtPts = 25; vtStatus = "À jour"; }
  }
  breakdown.push({ label: "Visite technique", points: vtPts, max: 25, status: vtStatus });
  total += vtPts;

  // 3. Entretien récent (20 pts)
  const vMaint = maintenances
    .filter((m) => m.vehicleId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  let maintPts = 0;
  let maintStatus = "Aucun entretien";
  if (vMaint[0]) {
    const days = dayjs().diff(dayjs(vMaint[0].date), "day");
    if (days < 180) { maintPts = 20; maintStatus = `Il y a ${days}j`; }
    else if (days < 365) { maintPts = 12; maintStatus = `Il y a ${days}j`; }
    else { maintPts = 5; maintStatus = `Il y a ${days}j`; }
  }
  breakdown.push({ label: "Entretien récent", points: maintPts, max: 20, status: maintStatus });
  total += maintPts;

  // 4. Carburant (15 pts)
  const vFuels = fuels.filter((f) => f.vehicleId === vehicle.id);
  let fuelPts = 0;
  let fuelStatus = "Aucun plein";
  if (vFuels.length >= 3) { fuelPts = 15; fuelStatus = `${vFuels.length} pleins`; }
  else if (vFuels.length >= 1) { fuelPts = 8; fuelStatus = `${vFuels.length} plein(s)`; }
  breakdown.push({ label: "Carburant", points: fuelPts, max: 15, status: fuelStatus });
  total += fuelPts;

  // 5. Kilométrage à jour (15 pts)
  const lastActivity = [...vMaint, ...vFuels].sort((a: any, b: any) =>
    b.date.localeCompare(a.date)
  )[0] as any;
  let kmPts = 0;
  let kmStatus = "Jamais mis à jour";
  if (lastActivity) {
    const days = dayjs().diff(dayjs(lastActivity.date), "day");
    if (days < 30) { kmPts = 15; kmStatus = "Récent"; }
    else if (days < 90) { kmPts = 10; kmStatus = `Il y a ${days}j`; }
    else { kmPts = 3; kmStatus = `Il y a ${days}j`; }
  }
  breakdown.push({ label: "Kilométrage récent", points: kmPts, max: 15, status: kmStatus });
  total += kmPts;

  // Label
  let label = "Critique";
  let color = "#ef4444";
  if (total >= 90) { label = "Excellent"; color = "#10b981"; }
  else if (total >= 70) { label = "Bon"; color = "#3b82f6"; }
  else if (total >= 50) { label = "Moyen"; color = "#f59e0b"; }

  return { score: total, label, color, breakdown };
}
