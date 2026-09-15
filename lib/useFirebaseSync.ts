import { useEffect } from "react";
import { subscribeCollection, COLLECTIONS } from "./firestore";
import { useStore } from "./store";
import { useAuthStore } from "./authStore";
import { auth } from "./firebase";
import { Vehicle, Maintenance, Insurance, Inspection, Reminder, Fuel, VehicleDocument } from "../types";

export function useFirebaseSync() {
  const user = useAuthStore((s) => s.user);
  const setVehicles = useStore((s) => s._setVehicles);
  const setMaintenances = useStore((s) => s._setMaintenances);
  const setInsurances = useStore((s) => s._setInsurances);
  const setInspections = useStore((s) => s._setInspections);
  const setReminders = useStore((s) => s._setReminders);
  const setFuels = useStore((s) => s._setFuels);
  const setDocuments = useStore((s) => s._setDocuments);
  const clearAll = useStore((s) => s.clearAll);

  useEffect(() => {
    // ⛔️ Pas connecté → on vide tout et on n'écoute rien
    if (!user) {
      clearAll();
      return;
    }

    // ⛔️ Attendre que Firebase Auth ait bien le user en mémoire
    let unsubs: Array<() => void> = [];
    let cancelled = false;

    const start = async () => {
      // Attendre que auth.currentUser soit bien défini
      const waitForAuth = new Promise<void>((resolve) => {
        if (auth.currentUser) return resolve();
        const unsubscribe = auth.onAuthStateChanged((u) => {
          if (u) {
            unsubscribe();
            resolve();
          }
        });
        // timeout de sécurité
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 3000);
      });

      await waitForAuth;
      if (cancelled) return;

      unsubs.push(
        subscribeCollection<Vehicle>(COLLECTIONS.vehicles, setVehicles)
      );
      unsubs.push(
        subscribeCollection<Maintenance>(COLLECTIONS.maintenances, setMaintenances)
      );
      unsubs.push(
        subscribeCollection<Insurance>(COLLECTIONS.insurances, setInsurances)
      );
      unsubs.push(
        subscribeCollection<Inspection>(COLLECTIONS.inspections, setInspections)
      );
      unsubs.push(
        subscribeCollection<Reminder>(COLLECTIONS.reminders, setReminders)
      );
      unsubs.push(
        subscribeCollection<Fuel>(COLLECTIONS.fuels, setFuels)
      );
      unsubs.push(
        subscribeCollection<VehicleDocument>(COLLECTIONS.documents, setDocuments)
      );
    };

    start();

    return () => {
      cancelled = true;
      unsubs.forEach((fn) => fn());
      unsubs = [];
    };
  }, [user, setVehicles, setMaintenances, setInsurances, setInspections, setReminders, setFuels, setDocuments, clearAll]);
}
