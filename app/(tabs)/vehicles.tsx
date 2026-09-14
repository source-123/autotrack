import { View, Text, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { Plus, Car } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { formatMileage } from "../../lib/utils";
import { Vehicle } from "../../types";
import { Button } from "../../components/ui/Button";

export default function VehiclesScreen() {
  const vehicles = useStore((s) => s.vehicles);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Véhicules",
          headerRight: () => (
            <Pressable onPress={() => router.push("/vehicle/new")} className="mr-4">
              <Plus color="#2563eb" size={24} />
            </Pressable>
          ),
        }}
      />
      {vehicles.length === 0 ? (
        <View className="flex-1 bg-slate-50 items-center justify-center p-6">
          <View className="bg-blue-100 rounded-full p-8 mb-5">
            <Car color="#2563eb" size={56} />
          </View>
          <Text className="text-2xl font-bold text-slate-900">Aucun véhicule</Text>
          <Text className="text-slate-500 text-center mt-2 mb-6 max-w-xs">
            Ajoutez votre premier véhicule pour commencer à suivre son entretien.
          </Text>
          <Button
            title="Ajouter un véhicule"
            onPress={() => router.push("/vehicle/new")}
            icon={<Plus color="#fff" size={20} />}
          />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          className="bg-slate-50"
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
        />
      )}
    </>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const hasPhoto = !!vehicle.photoUri && vehicle.photoUri.length > 0;

  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden active:bg-slate-50"
    >
      {hasPhoto ? (
        <Image
          source={{ uri: vehicle.photoUri }}
          style={{ width: "100%", height: 180, backgroundColor: "#e2e8f0" }}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 140,
            backgroundColor: "#2563eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Car color="#fff" size={48} />
        </View>
      )}

      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text
              className="text-sm text-slate-500 mt-0.5"
              style={{ writingDirection: "ltr" }}
            >
              {vehicle.plate} • {vehicle.year}
            </Text>
          </View>
          <View className="bg-blue-100 rounded-full px-3 py-1">
            <Text className="text-xs font-bold text-blue-700 uppercase">{vehicle.fuel}</Text>
          </View>
        </View>
        <View className="mt-3 pt-3 border-t border-slate-100 flex-row justify-between">
          <Text className="text-slate-500 text-xs">Kilométrage</Text>
          <Text className="text-slate-900 font-semibold text-sm">
            {formatMileage(vehicle.mileage)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
