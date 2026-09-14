import { Image } from "expo-image";
import { View } from "react-native";
import { Car } from "lucide-react-native";

type Props = {
  uri?: string;
  height?: number;
  rounded?: boolean;
};

export function VehiclePhoto({ uri, height = 160, rounded = false }: Props) {
  const radius = rounded ? 12 : 0;

  if (uri && uri.length > 0) {
    return (
      <Image
        source={{ uri }}
        style={{ width: "100%", height, borderRadius: radius, backgroundColor: "#e2e8f0" }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View
      style={{
        width: "100%",
        height: height * 0.8,
        borderRadius: radius,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Car color="#fff" size={48} />
    </View>
  );
}
