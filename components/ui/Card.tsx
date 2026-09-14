import { View, ViewProps } from "react-native";

export function Card({ children, className = "", ...props }: ViewProps & { className?: string }) {
  return (
    <View
      {...props}
      className={`bg-white rounded-2xl p-4 border border-slate-200 ${className}`}
      style={[
        {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        },
        props.style,
      ]}
    >
      {children}
    </View>
  );
}
