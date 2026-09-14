import { useEffect } from "react";
import { useStore } from "./store";
import { requestPermission, rescheduleAll } from "./notifications";

export function useNotifications() {
  const vehicles = useStore((s) => s.vehicles);
  const maintenances = useStore((s) => s.maintenances);
  const insurances = useStore((s) => s.insurances);
  const inspections = useStore((s) => s.inspections);

  // Demande la permission au démarrage
  useEffect(() => {
    requestPermission().catch(() => {});
  }, []);

  // Reprogramme à chaque changement de données
  useEffect(() => {
    rescheduleAll(vehicles, maintenances, insurances, inspections).catch(() => {});
  }, [vehicles, maintenances, insurances, inspections]);
}
