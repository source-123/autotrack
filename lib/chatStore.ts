import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
};

type State = {
  messages: ChatMessage[];
  addMessage: (m: Omit<ChatMessage, "id" | "timestamp">) => void;
  clear: () => void;
};

const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const useChatStore = create<State>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (m) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { ...m, id: genId(), timestamp: Date.now() },
          ],
        })),
      clear: () => set({ messages: [] }),
    }),
    {
      name: "autotrack-chat",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
