import { router } from "expo-router";

/**
 * Retourne en arrière si possible, sinon redirige vers une route de secours.
 * Évite l'erreur "The action 'GO_BACK' was not handled by any navigator".
 */
export function goBackSafely(fallback: string = "/(tabs)") {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as any);
  }
}
