import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { auth } from "./firebase";

const IMGBB_API_KEY = "bd1d888a1a80db226d73184cfd254c0f";

export async function pickImageForDoc(): Promise<{ uri: string; type: "image" } | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled) return null;
  return { uri: result.assets[0].uri, type: "image" };
}

export async function pickPdfForDoc(): Promise<{ uri: string; type: "pdf"; name: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, type: "pdf", name: asset.name || "document.pdf" };
}

export async function uploadDocumentImage(localUri: string): Promise<string> {
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

/**
 * Pour les PDF, on ne peut pas utiliser ImgBB. On encode en base64 côté web
 * ou on stocke l'URI local (mobile). Version simple pour l'instant.
 */
export async function uploadDocumentPdf(localUri: string): Promise<string> {
  // Version basique : on retourne l'URI local (fonctionne sur mobile)
  // Sur web, on pourrait encoder en base64 mais ça alourdit Firestore
  return localUri;
}
