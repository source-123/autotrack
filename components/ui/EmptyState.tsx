import { View, Text } from "react-native";

type Props = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <View className="items-center justify-center p-6">
      <View className="bg-slate-100 rounded-full p-6 mb-4">{icon}</View>
      <Text className="text-lg font-bold text-slate-900 text-center">{title}</Text>
      {description && (
        <Text className="text-slate-500 text-sm text-center mt-1 mb-5 max-w-xs">
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
