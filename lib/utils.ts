import dayjs from "dayjs";
import { Currency } from "../types";

export const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "Dollar US", symbol: "$" },
  { code: "DZD", label: "Dinar algérien", symbol: "DA" },
  { code: "MAD", label: "Dirham marocain", symbol: "DH" },
  { code: "TND", label: "Dinar tunisien", symbol: "DT" },
  { code: "GBP", label: "Livre sterling", symbol: "£" },
  { code: "CHF", label: "Franc suisse", symbol: "CHF" },
  { code: "CAD", label: "Dollar canadien", symbol: "$ CA" },
];

export function currencySymbol(code: Currency): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "";
}

export function formatMoney(amount: number, code: Currency = "EUR"): string {
  const symbol = currencySymbol(code);
  const formatted = amount.toLocaleString("fr-FR", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${symbol}`;
}

export function formatDate(date?: string) {
  if (!date) return "-";
  return dayjs(date).format("DD/MM/YYYY");
}

export function formatMileage(km: number) {
  return km.toLocaleString("fr-FR") + " km";
}

export function daysUntil(date?: string): number | null {
  if (!date) return null;
  return dayjs(date).diff(dayjs(), "day");
}

export function statusFromDate(date?: string): "ok" | "soon" | "expired" {
  const days = daysUntil(date);
  if (days === null) return "ok";
  if (days < 0) return "expired";
  if (days < 30) return "soon";
  return "ok";
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function totalCost(items: { cost: number }[]) {
  return items.reduce((sum, item) => sum + (item.cost || 0), 0);
}
