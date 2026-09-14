import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Vehicle, Maintenance, Insurance, Inspection, Reminder, Currency, Fuel,
} from "../types";
import { saveDoc, removeDoc, COLLECTIONS } from "./firestore";
import { auth } from "./firebase";

function currentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

// Ajoute userId à un objet si on est connecté
function withUserId<T extends object>(obj: T): T & { userId?: string } {
  const uid = currentUserId();
  return uid ? { ...obj, userId: uid } : obj;
}

type State = {
  currency: Currency;
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  insurances: Insurance[];
  inspections: Inspection[];
  reminders: Reminder[];

  _setVehicles: (v: Vehicle[]) => void;
  _setMaintenances: (m: Maintenance[]) => void;
  _setInsurances: (i: Insurance[]) => void;
  _setInspections: (i: Inspection[]) => void;
  _setReminders: (r: Reminder[]) => void;
  _setFuels: (f: Fuel[]) => void;

  setCurrency: (c: Currency) => void;

  addVehicle: (v: Omit<Vehicle, "id" | "createdAt">) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;

  addMaintenance: (m: Omit<Maintenance, "id" | "createdAt">) => void;
  updateMaintenance: (id: string, m: Partial<Maintenance>) => void;
  removeMaintenance: (id: string) => void;

  addInsurance: (i: Omit<Insurance, "id">) => void;
  updateInsurance: (id: string, i: Partial<Insurance>) => void;
  removeInsurance: (id: string) => void;

  addInspection: (i: Omit<Inspection, "id">) => void;
  updateInspection: (id: string, i: Partial<Inspection>) => void;
  removeInspection: (id: string) => void;

  addReminder: (r: Omit<Reminder, "id">) => void;
  addFuel: (f: Omit<Fuel, "id">) => void;
  updateFuel: (id: string, f: Partial<Fuel>) => void;
  removeFuel: (id: string) => void;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;

  clearAll: () => void;
};

const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      currency: "EUR",
      vehicles: [],
      maintenances: [],
      insurances: [],
      inspections: [],
      reminders: [],
      fuels: [],

      _setVehicles: (vehicles) => set({ vehicles }),
      _setMaintenances: (maintenances) => set({ maintenances }),
      _setInsurances: (insurances) => set({ insurances }),
      _setInspections: (inspections) => set({ inspections }),
      _setReminders: (reminders) => set({ reminders }),
      _setFuels: (fuels) => set({ fuels }),

      setCurrency: (currency) => set({ currency }),

      clearAll: () => set({
        vehicles: [], maintenances: [], insurances: [], inspections: [], reminders: [], fuels: [],
      }),

      addVehicle: (v) => {
        const item = withUserId({ ...v, id: genId(), createdAt: new Date().toISOString() });
        set((s) => ({ vehicles: [...s.vehicles, item as any] }));
        saveDoc(COLLECTIONS.vehicles, item as any);
      },

      updateVehicle: (id, v) => {
        set((s) => ({
          vehicles: s.vehicles.map((x) => (x.id === id ? { ...x, ...v } : x)),
        }));
        const updated = get().vehicles.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.vehicles, updated as any);
      },

      removeVehicle: (id) => {
        const toRemove = get();
        set((s) => ({
          vehicles: s.vehicles.filter((x) => x.id !== id),
          maintenances: s.maintenances.filter((x) => x.vehicleId !== id),
          insurances: s.insurances.filter((x) => x.vehicleId !== id),
          inspections: s.inspections.filter((x) => x.vehicleId !== id),
          reminders: s.reminders.filter((x) => x.vehicleId !== id),
        }));
        removeDoc(COLLECTIONS.vehicles, id);
        toRemove.maintenances.filter((x) => x.vehicleId === id)
          .forEach((x) => removeDoc(COLLECTIONS.maintenances, x.id));
        toRemove.insurances.filter((x) => x.vehicleId === id)
          .forEach((x) => removeDoc(COLLECTIONS.insurances, x.id));
        toRemove.inspections.filter((x) => x.vehicleId === id)
          .forEach((x) => removeDoc(COLLECTIONS.inspections, x.id));
      },

      addMaintenance: (m) => {
        const item = withUserId({ ...m, id: genId(), createdAt: new Date().toISOString() });
        set((s) => ({ maintenances: [...s.maintenances, item as any] }));
        saveDoc(COLLECTIONS.maintenances, item as any);
      },

      updateMaintenance: (id, m) => {
        set((s) => ({
          maintenances: s.maintenances.map((x) => (x.id === id ? { ...x, ...m } : x)),
        }));
        const updated = get().maintenances.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.maintenances, updated as any);
      },

      removeMaintenance: (id) => {
        set((s) => ({ maintenances: s.maintenances.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.maintenances, id);
      },

      addInsurance: (i) => {
        const item = withUserId({ ...i, id: genId() });
        set((s) => ({ insurances: [...s.insurances, item as any] }));
        saveDoc(COLLECTIONS.insurances, item as any);
      },

      updateInsurance: (id, i) => {
        set((s) => ({
          insurances: s.insurances.map((x) => (x.id === id ? { ...x, ...i } : x)),
        }));
        const updated = get().insurances.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.insurances, updated as any);
      },

      removeInsurance: (id) => {
        set((s) => ({ insurances: s.insurances.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.insurances, id);
      },

      addInspection: (i) => {
        const item = withUserId({ ...i, id: genId() });
        set((s) => ({ inspections: [...s.inspections, item as any] }));
        saveDoc(COLLECTIONS.inspections, item as any);
      },

      updateInspection: (id, i) => {
        set((s) => ({
          inspections: s.inspections.map((x) => (x.id === id ? { ...x, ...i } : x)),
        }));
        const updated = get().inspections.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.inspections, updated as any);
      },

      removeInspection: (id) => {
        set((s) => ({ inspections: s.inspections.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.inspections, id);
      },

      addReminder: (r) => {
        const item = withUserId({ ...r, id: genId() });
        set((s) => ({ reminders: [...s.reminders, item as any] }));
        saveDoc(COLLECTIONS.reminders, item as any);
      },

      toggleReminder: (id) => {
        set((s) => ({
          reminders: s.reminders.map((x) => x.id === id ? { ...x, notified: !x.notified } : x),
        }));
        const updated = get().reminders.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.reminders, updated as any);
      },

      removeReminder: (id) => {
        set((s) => ({ reminders: s.reminders.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.reminders, id);
      },

      // ============ FUELS ============
      addFuel: (f) => {
        const item = withUserId({ ...f, id: genId() });
        set((s) => ({ fuels: [...s.fuels, item as any] }));
        saveDoc(COLLECTIONS.fuels, item as any);
      },

      updateFuel: (id, f) => {
        set((s) => ({
          fuels: s.fuels.map((x) => (x.id === id ? { ...x, ...f } : x)),
        }));
        const updated = get().fuels.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.fuels, updated as any);
      },

      removeFuel: (id) => {
        set((s) => ({ fuels: s.fuels.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.fuels, id);
      },
    }),
    {
      name: "autotrack-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currency: state.currency }) as any,
    }
  )
);
