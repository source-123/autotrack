import { useEffect } from "react";
import { subscribeCollection, COLLECTIONS } from "./firestore";
import { useStore } from "./store";
import { useAuthStore } from "./authStore";
import { Vehicle, Maintenance, Insurance, Inspection, Reminder } from "../types";

export function useFirebaseSync() {
  const user = useAuthStore((s) => s.user);
  const setVehicles = useStore((s) => s._setVehicles);
  const setMaintenances = useStore((s) => s._setMaintenances);
  const setInsurances = useStore((s) => s._setInsurances);
  const setInspections = useStore((s) => s._setInspections);
  const setReminders = useStore((s) => s._setReminders);
  const clearAll = useStore((s) => s.clearAll);

  useEffect(() => {
    // Si pas connecté, on vide tout
    if (!user) {
      clearAll();
      return;
    }

    // Sinon on s'abonne à Firestore pour cet utilisateur
    const unsubVehicles = subscribeCollection<Vehicle>(COLLECTIONS.vehicles, setVehicles);
    const unsubMaint = subscribeCollection<Maintenance>(COLLECTIONS.maintenances, setMaintenances);
    const unsubIns = subscribeCollection<Insurance>(COLLECTIONS.insurances, setInsurances);
    const unsubInsp = subscribeCollection<Inspection>(COLLECTIONS.inspections, setInspections);
    const unsubRem = subscribeCollection<Reminder>(COLLECTIONS.reminders, setReminders);

    return () => {
      unsubVehicles();
      unsubMaint();
      unsubIns();
      unsubInsp();
      unsubRem();
    };
  }, [user, setVehicles, setMaintenances, setInsurances, setInspections, setReminders, clearAll]);
}
