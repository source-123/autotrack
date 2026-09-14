import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { colorScheme } from "nativewind";

/**
 * Synchronise le thème système avec NativeWind.
 * Sur web : utilise les préférences navigateur.
 * Sur mobile : utilise les préférences système (clair/sombre).
 */
export function useNativeWindTheme() {
  const systemScheme = useColorScheme();

  useEffect(() => {
    if (systemScheme) {
      colorScheme.set(systemScheme);
    }
  }, [systemScheme]);
}
