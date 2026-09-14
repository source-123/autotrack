import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { colorScheme } from "nativewind";

/**
 * Détecte le thème système et le synchronise avec NativeWind.
 * - Web : utilise window.matchMedia("(prefers-color-scheme: dark)")
 * - Mobile : utilise l'API NativeWind colorScheme
 */
function getSystemScheme(): "light" | "dark" {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    // Fallback : vérifie si <html> a déjà la classe
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return "light";
  }
  // Mobile
  const { Appearance } = require("react-native");
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

export function useNativeWindTheme() {
  const [scheme, setScheme] = useState<"light" | "dark">(getSystemScheme);

  useEffect(() => {
    // Application initiale
    applyScheme(scheme);

    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const newScheme = e.matches ? "dark" : "light";
        setScheme(newScheme);
        applyScheme(newScheme);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      // Mobile : écoute les changements
      const { Appearance } = require("react-native");
      const sub = Appearance.addChangeListener(({ colorScheme: cs }: { colorScheme: "light" | "dark" | null | undefined }) => {
        const newScheme = cs === "dark" ? "dark" : "light";
        setScheme(newScheme);
        applyScheme(newScheme);
      });
      return () => sub.remove();
    }
  }, []);
}

function applyScheme(scheme: "light" | "dark") {
  // NativeWind
  try {
    colorScheme.set(scheme);
  } catch (e) {}

  // Web : classe sur <html>
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const root = document.documentElement;
    if (scheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      if (document.body) document.body.style.backgroundColor = "#0f172a";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      if (document.body) document.body.style.backgroundColor = "#f8fafc";
    }
  }
}

// 🧪 Utilitaire : forcer manuellement
export function setDarkMode(on: boolean) {
  applyScheme(on ? "dark" : "light");
}
