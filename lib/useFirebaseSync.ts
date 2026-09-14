import { useEffect } from "react";
import { subscribeCollection, COLLECTIONS } from "./firestore";
import { useStore } from "./store";
import { Vehicle, Maintenance, Insurance, Inspection, Reminder } from "../types";

/**
 * Synchronise l'app avec Firestore en temps réel.
 * - Sur écoute : Firebase → Zustand
 * - Les actions Zustand écrivent vers Firebase (voir store.ts)
 */
export function useFirebaseSync() {
  const setVehicles = useStore((s) => s._setVehicles);
  const setMaintenances = useStore((s) => s._setMaintenances);
  const setInsurances = useStore((s) => s._setInsurances);
  const setInspections = useStore((s) => s._setInspections);
  const setReminders = useStore((s) => s._setReminders);

  useEffect(() => {
    const unsubVehicles = subscribeCollection<Vehicle>(
      COLLECTIONS.vehicles,
      setVehicles
    );
    const unsubMaint = subscribeCollection<Maintenance>(
      COLLECTIONS.maintenances,
      setMaintenances
    );
    const unsubIns = subscribeCollection<Insurance>(
      COLLECTIONS.insurances,
      setInsurances
    );
    const unsubInsp = subscribeCollection<Inspection>(
      COLLECTIONS.inspections,
      setInspections
    );
    const unsubRem = subscribeCollection<Reminder>(
      COLLECTIONS.reminders,
      setReminders
    );

    return () => {
      unsubVehicles();
      unsubMaint();
      unsubIns();
      unsubInsp();
      unsubRem();
    };
  }, [setVehicles, setMaintenances, setInsurances, setInspections, setReminders]);
}
