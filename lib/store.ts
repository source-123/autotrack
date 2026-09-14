import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Vehicle, Maintenance, Insurance, Inspection, Reminder, Currency,
} from "../types";
import { saveDoc, removeDoc, COLLECTIONS } from "./firestore";

type State = {
  currency: Currency;
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  insurances: Insurance[];
  inspections: Inspection[];
  reminders: Reminder[];

  // Setters internes (appelés par useFirebaseSync)
  _setVehicles: (v: Vehicle[]) => void;
  _setMaintenances: (m: Maintenance[]) => void;
  _setInsurances: (i: Insurance[]) => void;
  _setInspections: (i: Inspection[]) => void;
  _setReminders: (r: Reminder[]) => void;

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
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;
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

      _setVehicles: (vehicles) => set({ vehicles }),
      _setMaintenances: (maintenances) => set({ maintenances }),
      _setInsurances: (insurances) => set({ insurances }),
      _setInspections: (inspections) => set({ inspections }),
      _setReminders: (reminders) => set({ reminders }),

      setCurrency: (currency) => set({ currency }),

      // ============ VEHICLES ============
      addVehicle: (v) => {
        const item: Vehicle = {
          ...v,
          id: genId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ vehicles: [...s.vehicles, item] }));
        saveDoc(COLLECTIONS.vehicles, item);
      },

      updateVehicle: (id, v) => {
        set((s) => ({
          vehicles: s.vehicles.map((x) => (x.id === id ? { ...x, ...v } : x)),
        }));
        const updated = get().vehicles.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.vehicles, updated);
      },

      removeVehicle: (id) => {
        set((s) => ({
          vehicles: s.vehicles.filter((x) => x.id !== id),
          maintenances: s.maintenances.filter((x) => x.vehicleId !== id),
          insurances: s.insurances.filter((x) => x.vehicleId !== id),
          inspections: s.inspections.filter((x) => x.vehicleId !== id),
          reminders: s.reminders.filter((x) => x.vehicleId !== id),
        }));
        removeDoc(COLLECTIONS.vehicles, id);
        // Supprimer aussi les enfants côté Firebase
        get().maintenances
          .filter((x) => x.vehicleId === id)
          .forEach((x) => removeDoc(COLLECTIONS.maintenances, x.id));
        get().insurances
          .filter((x) => x.vehicleId === id)
          .forEach((x) => removeDoc(COLLECTIONS.insurances, x.id));
        get().inspections
          .filter((x) => x.vehicleId === id)
          .forEach((x) => removeDoc(COLLECTIONS.inspections, x.id));
      },

      // ============ MAINTENANCES ============
      addMaintenance: (m) => {
        const item: Maintenance = {
          ...m,
          id: genId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ maintenances: [...s.maintenances, item] }));
        saveDoc(COLLECTIONS.maintenances, item);
      },

      updateMaintenance: (id, m) => {
        set((s) => ({
          maintenances: s.maintenances.map((x) =>
            x.id === id ? { ...x, ...m } : x
          ),
        }));
        const updated = get().maintenances.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.maintenances, updated);
      },

      removeMaintenance: (id) => {
        set((s) => ({
          maintenances: s.maintenances.filter((x) => x.id !== id),
        }));
        removeDoc(COLLECTIONS.maintenances, id);
      },

      // ============ INSURANCES ============
      addInsurance: (i) => {
        const item: Insurance = { ...i, id: genId() };
        set((s) => ({ insurances: [...s.insurances, item] }));
        saveDoc(COLLECTIONS.insurances, item);
      },

      updateInsurance: (id, i) => {
        set((s) => ({
          insurances: s.insurances.map((x) =>
            x.id === id ? { ...x, ...i } : x
          ),
        }));
        const updated = get().insurances.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.insurances, updated);
      },

      removeInsurance: (id) => {
        set((s) => ({ insurances: s.insurances.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.insurances, id);
      },

      // ============ INSPECTIONS ============
      addInspection: (i) => {
        const item: Inspection = { ...i, id: genId() };
        set((s) => ({ inspections: [...s.inspections, item] }));
        saveDoc(COLLECTIONS.inspections, item);
      },

      updateInspection: (id, i) => {
        set((s) => ({
          inspections: s.inspections.map((x) =>
            x.id === id ? { ...x, ...i } : x
          ),
        }));
        const updated = get().inspections.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.inspections, updated);
      },

      removeInspection: (id) => {
        set((s) => ({ inspections: s.inspections.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.inspections, id);
      },

      // ============ REMINDERS ============
      addReminder: (r) => {
        const item: Reminder = { ...r, id: genId() };
        set((s) => ({ reminders: [...s.reminders, item] }));
        saveDoc(COLLECTIONS.reminders, item);
      },

      toggleReminder: (id) => {
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, notified: !x.notified } : x
          ),
        }));
        const updated = get().reminders.find((x) => x.id === id);
        if (updated) saveDoc(COLLECTIONS.reminders, updated);
      },

      removeReminder: (id) => {
        set((s) => ({ reminders: s.reminders.filter((x) => x.id !== id) }));
        removeDoc(COLLECTIONS.reminders, id);
      },
    }),
    {
      name: "autotrack-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // On ne persiste que la devise en local (le reste vient de Firebase)
      partialize: (state) => ({ currency: state.currency }) as any,
    }
  )
);
