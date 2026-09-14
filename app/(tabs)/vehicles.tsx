import { View, Text, FlatList, Pressable } from "react-native";
import { router, Stack } from "expo-router";
import { Car, Plus } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { formatMileage } from "../../lib/utils";
import { Vehicle } from "../../types";

export default function VehiclesScreen() {
  const vehicles = useStore((s) => s.vehicles);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Véhicules",
          headerRight: () => (
            <Pressable onPress={() => router.push("/vehicle/new")} className="mr-4">
              <Plus color="#3b82f6" size={24} />
            </Pressable>
          ),
        }}
      />
      {vehicles.length === 0 ? (
        <View className="flex-1 bg-zinc-50 items-center justify-center p-6">
          <View className="bg-blue-100 rounded-full p-6 mb-4">
            <Car color="#3b82f6" size={56} />
          </View>
          <Text className="text-xl font-bold text-zinc-900">Aucun véhicule</Text>
          <Text className="text-zinc-500 text-center mt-2 mb-6">
            Ajoutez votre premier véhicule pour commencer à suivre son entretien.
          </Text>
          <Pressable
            onPress={() => router.push("/vehicle/new")}
            className="bg-blue-500 rounded-xl px-6 py-3 flex-row items-center gap-2"
          >
            <Plus color="#fff" size={20} />
            <Text className="text-white font-bold">Ajouter un véhicule</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          className="bg-zinc-50"
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
        />
      )}
    </>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      className="bg-white rounded-2xl p-4 border border-zinc-200 active:bg-zinc-100"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold text-zinc-900">
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text className="text-sm text-zinc-500 mt-1">
            {vehicle.plate} • {vehicle.year}
          </Text>
        </View>
        <View className="bg-blue-100 rounded-lg px-3 py-1">
          <Text className="text-xs font-bold text-blue-700 uppercase">
            {vehicle.fuel}
          </Text>
        </View>
      </View>
      <View className="mt-3 pt-3 border-t border-zinc-100 flex-row justify-between">
        <Text className="text-zinc-500 text-xs">Kilométrage</Text>
        <Text className="text-zinc-900 font-semibold text-sm">
          {formatMileage(vehicle.mileage)}
        </Text>
      </View>
    </Pressable>
  );
}
