import { create } from "zustand";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export type PremiumStatus = {
  isPremium: boolean;
  plan: "free" | "monthly" | "yearly" | "lifetime";
  premiumUntil: number | null; // timestamp
  loading: boolean;
};

type State = PremiumStatus & {
  _unsubscribe: (() => void) | null;
  subscribeToUser: (uid: string) => void;
  unsubscribe: () => void;
};

export const usePremium = create<State>((set, get) => ({
  isPremium: false,
  plan: "free",
  premiumUntil: null,
  loading: true,
  _unsubscribe: null,

  subscribeToUser: (uid: string) => {
    // Nettoyer l'ancien listener
    const old = get()._unsubscribe;
    if (old) old();

    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          set({ isPremium: false, plan: "free", premiumUntil: null, loading: false });
          return;
        }
        const data = snap.data();
        const now = Date.now();
        const until = data.premiumUntil?.toMillis?.() || data.premiumUntil || null;
        const isExpired = until && until < now;
        const isPremium = !!data.isPremium && !isExpired;

        set({
          isPremium,
          plan: data.plan || "free",
          premiumUntil: until,
          loading: false,
        });
      },
      (error) => {
        console.error("Erreur premium:", error);
        set({ loading: false });
      }
    );

    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    const unsub = get()._unsubscribe;
    if (unsub) unsub();
    set({ _unsubscribe: null });
  },
}));
