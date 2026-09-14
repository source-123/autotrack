import * as ImagePicker from "expo-image-picker";

const IMGBB_API_KEY = "bd1d888a1a80db226d73184cfd254c0f";

export async function pickImage(source: "camera" | "library" = "library"): Promise<string | null> {
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function uploadVehiclePhoto(_vehicleId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append("image", blob);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Échec upload");
  return json.data.url;
}

export async function deleteVehiclePhoto(_vehicleId: string): Promise<void> {
  // ImgBB gratuit ne propose pas de suppression programmatique — on ignore
}
