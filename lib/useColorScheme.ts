import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Retourne "light" ou "dark" selon les préférences système.
 * Utilisé pour adapter les couleurs via les classes `dark:` de NativeWind.
 */
export function useAppColorScheme(): "light" | "dark" {
  const scheme = useRNColorScheme();
  return scheme === "dark" ? "dark" : "light";
}
