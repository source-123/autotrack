import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type State = {
  completed: boolean;
  neverShow: boolean;
  markCompleted: () => void;
  setNeverShow: (v: boolean) => void;
  reset: () => void;
};

export const useOnboardingStore = create<State>()(
  persist(
    (set) => ({
      completed: false,
      neverShow: false,
      markCompleted: () => set({ completed: true }),
      setNeverShow: (v) => set({ neverShow: v }),
      reset: () => set({ completed: false, neverShow: false }),
    }),
    {
      name: "autotrack-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
