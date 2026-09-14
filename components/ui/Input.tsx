import { View, Text, TextInput, TextInputProps } from "react-native";

type Props = TextInputProps & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
};

export function Input({ label, icon, error, className = "", ...props }: Props) {
  return (
    <View className="gap-2">
      {label && (
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-white dark:bg-slate-800 border rounded-xl px-3 ${
          error ? "border-red-400" : "border-slate-200 dark:border-slate-700"
        }`}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          {...props}
          className={`flex-1 py-3 text-slate-900 dark:text-white ${className}`}
          placeholderTextColor="#94a3b8"
        />
      </View>
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  );
}
