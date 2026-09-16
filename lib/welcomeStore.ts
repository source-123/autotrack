import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type State = {
  seenByUser: Record<string, boolean>; // Persistant : "ne plus afficher"
  dismissedInSession: boolean;         // Session uniquement
  markSeen: (uid: string) => void;
  hasSeen: (uid: string) => boolean;
  dismiss: () => void;
  resetDismiss: () => void;
  reset: (uid?: string) => void;
};

export const useWelcomeStore = create<State>()(
  persist(
    (set, get) => ({
      seenByUser: {},
      dismissedInSession: false,
      markSeen: (uid) =>
        set((s) => ({ seenByUser: { ...s.seenByUser, [uid]: true } })),
      hasSeen: (uid) => !!get().seenByUser[uid],
      dismiss: () => set({ dismissedInSession: true }),
      resetDismiss: () => set({ dismissedInSession: false }),
      reset: (uid) =>
        set((s) => {
          if (!uid) return { seenByUser: {}, dismissedInSession: false };
          const copy = { ...s.seenByUser };
          delete copy[uid];
          return { seenByUser: copy, dismissedInSession: false };
        }),
    }),
    {
      name: "autotrack-welcome",
      storage: createJSONStorage(() => AsyncStorage),
      // Ne persiste PAS dismissedInSession
      partialize: (state) => ({ seenByUser: state.seenByUser }) as any,
    }
  )
);
