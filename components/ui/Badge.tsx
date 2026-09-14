import { View, Text } from "react-native";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

const variants: Record<Variant, { bg: string; text: string }> = {
  success: { bg: "bg-emerald-100", text: "text-emerald-700" },
  warning: { bg: "bg-amber-100", text: "text-amber-700" },
  danger: { bg: "bg-red-100", text: "text-red-700" },
  info: { bg: "bg-blue-100", text: "text-blue-700" },
  neutral: { bg: "bg-slate-100", text: "text-slate-700" },
};

export function Badge({ label, variant = "neutral" }: { label: string; variant?: Variant }) {
  const v = variants[variant];
  return (
    <View className={`${v.bg} rounded-full px-2.5 py-1`}>
      <Text className={`${v.text} text-xs font-bold uppercase`}>{label}</Text>
    </View>
  );
}
