import { create } from "zustand";
import { AuthUser, subscribeAuth } from "./auth";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  _init: () => void;
  _setUser: (u: AuthUser | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  _setUser: (user) => set({ user, loading: false }),

  _init: () => {
    if (get().initialized) return;
    set({ initialized: true });
    subscribeAuth((user) => {
      set({ user, loading: false });
    });
  },
}));
