import { useEffect } from "react";
import { useAuthStore } from "./authStore";
import { usePremium } from "./premiumStore";

export function usePremiumSubscription() {
  const user = useAuthStore((s) => s.user);
  const subscribeToUser = usePremium((s) => s.subscribeToUser);
  const unsubscribe = usePremium((s) => s.unsubscribe);

  useEffect(() => {
    if (user?.uid) {
      subscribeToUser(user.uid);
    } else {
      unsubscribe();
    }
    return () => unsubscribe();
  }, [user?.uid]);
}
