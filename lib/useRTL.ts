import { useEffect } from "react";
import { Platform, I18nManager } from "react-native";
import { useStore } from "./store";

/**
 * Active/désactive le RTL selon la langue.
 * - Web : applique `dir="rtl"` sur <html>
 * - Mobile : nécessite un redémarrage pour appliquer complètement
 */
export function useRTL() {
  const language = useStore((s) => s.language);

  useEffect(() => {
    const shouldRTL = language === "ar";

    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.dir = shouldRTL ? "rtl" : "ltr";
      document.documentElement.lang = language;
    } else if (Platform.OS !== "web") {
      // Sur mobile, on indique à RN que le RTL doit être actif
      // Note : un redémarrage complet de l'app est nécessaire pour l'appliquer partout
      if (I18nManager.isRTL !== shouldRTL) {
        I18nManager.allowRTL(shouldRTL);
        I18nManager.forceRTL(shouldRTL);
      }
    }
  }, [language]);
}
