import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  icon,
  className = "",
  disabled,
  ...props
}: Props) {
  const bg = {
    primary: "bg-blue-600 active:bg-blue-700",
    secondary: "bg-slate-100 dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600",
    danger: "bg-red-500 active:bg-red-600",
    ghost: "bg-transparent active:bg-slate-100 dark:active:bg-slate-800",
  }[variant];

  const txt = {
    primary: "text-white",
    secondary: "text-slate-900 dark:text-white",
    danger: "text-white",
    ghost: "text-blue-600 dark:text-blue-400",
  }[variant];

  const sz = {
    sm: "py-2 px-3",
    md: "py-3 px-4",
    lg: "py-4 px-6",
  }[size];

  const tsize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-base",
  }[size];

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={`${bg} ${sz} rounded-xl flex-row items-center justify-center gap-2 ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#fff" : "#3b82f6"}
        />
      ) : (
        <>
          {icon}
          <Text className={`${txt} ${tsize} font-semibold text-center`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
