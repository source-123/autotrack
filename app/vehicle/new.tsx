import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Camera, X } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { goBackSafely } from "../../lib/navigation";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { pickImage, uploadVehiclePhoto } from "../../lib/upload";
import { Vehicle } from "../../types";

const FUELS: Vehicle["fuel"][] = ["essence", "diesel", "electrique", "hybride", "gpl"];

export default function VehicleFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const addVehicle = useStore((s) => s.addVehicle);
  const updateVehicle = useStore((s) => s.updateVehicle);
  const existing = useStore((s) => s.vehicles.find((v) => v.id === id));

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState<Vehicle["fuel"]>("essence");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existing) {
      setBrand(existing.brand);
      setModel(existing.model);
      setYear(String(existing.year));
      setPlate(existing.plate);
      setVin(existing.vin ?? "");
      setMileage(String(existing.mileage));
      setFuel(existing.fuel);
      setPhotoUri(existing.photoUri);
    }
  }, [existing]);

  const handlePickPhoto = async () => {
    const uri = await pickImage("library");
    if (uri) setPhotoUri(uri);
  };

  const handleSave = async () => {
    if (!brand.trim() || !model.trim() || !plate.trim() || !mileage.trim()) {
      Alert.alert("Champs manquants", "Marque, modèle, plaque et km sont obligatoires.");
      return;
    }

    setUploading(true);
    try {
      let finalPhotoUri = photoUri;

      if (
        photoUri &&
        (photoUri.startsWith("file://") ||
          photoUri.startsWith("blob:") ||
          photoUri.startsWith("data:") ||
          photoUri.startsWith("ph://"))
      ) {
        const vehicleId = id || Date.now().toString(36);
        finalPhotoUri = await uploadVehiclePhoto(vehicleId, photoUri);
      }

      const data = {
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year) || new Date().getFullYear(),
        plate: plate.trim().toUpperCase(),
        vin: vin.trim() || undefined,
        mileage: parseInt(mileage) || 0,
        fuel,
        photoUri: finalPhotoUri,
      };

      if (isEdit && id) updateVehicle(id, data);
      else addVehicle(data);

      goBackSafely();
    } catch (e: any) {
      Alert.alert("Erreur upload", e?.message || "Impossible d'uploader la photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "Modifier" : "Nouveau véhicule", headerShown: true }} />
      <ScrollView className="flex-1 bg-slate-50">
        <View className="p-4 gap-4">
          <Card>
            <Text className="text-sm font-semibold text-slate-700 mb-3">Photo du véhicule</Text>
            {photoUri ? (
              <View className="relative">
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: "100%", height: 192, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200}
                />
                <Pressable
                  onPress={() => setPhotoUri(undefined)}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                >
                  <X color="#fff" size={16} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickPhoto}
                className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl h-48 items-center justify-center"
              >
                <Camera color="#64748b" size={40} />
                <Text className="text-slate-600 text-sm font-semibold mt-2">
                  Ajouter une photo
                </Text>
              </Pressable>
            )}
          </Card>

          <Card className="gap-4">
            <Input label="Marque *" value={brand} onChangeText={setBrand} placeholder="Renault, Peugeot..." />
            <Input label="Modèle *" value={model} onChangeText={setModel} placeholder="Clio, 208..." />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input label="Année" value={year} onChangeText={setYear} keyboardType="number-pad" placeholder="2020" />
              </View>
              <View className="flex-1">
                <Input label="Plaque *" value={plate} onChangeText={setPlate} autoCapitalize="characters" placeholder="AB-123-CD" />
              </View>
            </View>
            <Input label="Kilométrage *" value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="45000" />
            <Input label="VIN (optionnel)" value={vin} onChangeText={setVin} autoCapitalize="characters" placeholder="VF1..." />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-slate-700">Carburant</Text>
              <View className="flex-row flex-wrap gap-2">
                {FUELS.map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFuel(f)}
                    className={`px-4 py-2 rounded-full border ${
                      fuel === f ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"
                    }`}
                  >
                    <Text className={`capitalize text-sm ${fuel === f ? "text-white font-semibold" : "text-slate-700"}`}>
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>

          <Button
            title={uploading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Enregistrer"}
            onPress={handleSave}
            loading={uploading}
            size="lg"
          />
        </View>
      </ScrollView>
    </>
  );
}
