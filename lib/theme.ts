/**
 * AutoTrack Design System
 * Palette pro, cohérente sur toute l'app
 */

export const colors = {
  // Primaire (bleu AutoTrack)
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  // Sémantique
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  // Neutres
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  white: "#ffffff",
  black: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const typography = {
  h1: "text-3xl font-bold text-slate-900",
  h2: "text-2xl font-bold text-slate-900",
  h3: "text-xl font-bold text-slate-900",
  h4: "text-lg font-semibold text-slate-900",
  body: "text-base text-slate-700",
  bodySm: "text-sm text-slate-600",
  caption: "text-xs text-slate-500",
  label: "text-sm font-semibold text-slate-700",
};

/** Palette de couleurs par type de maintenance */
export const maintenanceColors: Record<string, { bg: string; text: string; icon: string }> = {
  vidange: { bg: "bg-amber-100", text: "text-amber-700", icon: "#f59e0b" },
  filtre_air: { bg: "bg-sky-100", text: "text-sky-700", icon: "#0ea5e9" },
  filtre_huile: { bg: "bg-orange-100", text: "text-orange-700", icon: "#f97316" },
  bougies: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "#eab308" },
  plaquettes: { bg: "bg-rose-100", text: "text-rose-700", icon: "#f43f5e" },
  pneus: { bg: "bg-zinc-200", text: "text-zinc-700", icon: "#52525b" },
  batterie: { bg: "bg-lime-100", text: "text-lime-700", icon: "#84cc16" },
  courroie: { bg: "bg-violet-100", text: "text-violet-700", icon: "#8b5cf6" },
  chaine: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "#6366f1" },
  autre: { bg: "bg-slate-200", text: "text-slate-700", icon: "#64748b" },
};
