import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationPrefs = {
  enabled: boolean;
  daysBefore: { d30: boolean; d7: boolean; d1: boolean };
  mileageReminders: boolean;
};

type State = {
  prefs: NotificationPrefs;
  updatePrefs: (p: Partial<NotificationPrefs>) => void;
  toggleDay: (day: "d30" | "d7" | "d1") => void;
};

export const useNotificationPrefs = create<State>()(
  persist(
    (set) => ({
      prefs: {
        enabled: true,
        daysBefore: { d30: true, d7: true, d1: true },
        mileageReminders: true,
      },
      updatePrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      toggleDay: (day) =>
        set((s) => ({
          prefs: {
            ...s.prefs,
            daysBefore: { ...s.prefs.daysBefore, [day]: !s.prefs.daysBefore[day] },
          },
        })),
    }),
    {
      name: "autotrack-notif-prefs",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
