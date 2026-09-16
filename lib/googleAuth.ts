import { Platform } from "react-native";
import { GoogleAuthProvider, signInWithCredential, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "./firebase";

export const GOOGLE_CONFIG = {
  // ✅ Client ID Web Firebase (celui qui est dans google-services.json)
  webClientId: "791419730011-ujm55o5cjg35dh0j1osf6nogq73qncuj.apps.googleusercontent.com",
};

/**
 * Configuration native Google Sign-In (Android/iOS).
 */
let isConfigured = false;
export function configureGoogleSignIn() {
  if (isConfigured) return;
  if (Platform.OS === "web") return;

  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({
    webClientId: GOOGLE_CONFIG.webClientId,
    offlineAccess: false,
    scopes: ["profile", "email"],
  });
  isConfigured = true;
}

export async function signInWithGoogleMobile(): Promise<void> {
  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  configureGoogleSignIn();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const userInfo: any = await GoogleSignin.signIn();

  const idToken = userInfo?.idToken || userInfo?.data?.idToken;
  if (!idToken) throw new Error("Pas d'idToken reçu");

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}

export async function signInWithGoogleWeb(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
}

export async function checkGoogleRedirectResult() {
  if (Platform.OS !== "web") return { user: null, error: null };
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) return { user: result.user, error: null };
    return { user: null, error: null };
  } catch (e: any) {
    return { user: null, error: e?.code || "unknown" };
  }
}

export function translateGoogleError(code: string, lang: "fr" | "ar" = "fr"): string {
  const map: Record<string, { fr: string; ar: string }> = {
    "auth/popup-closed-by-user": { fr: "Connexion annulée.", ar: "تم إلغاء تسجيل الدخول." },
    "auth/popup-blocked": { fr: "Popup bloquée.", ar: "تم حظر النافذة." },
    "auth/account-exists-with-different-credential": { fr: "Compte existant.", ar: "حساب موجود." },
    "auth/network-request-failed": { fr: "Erreur réseau.", ar: "خطأ في الشبكة." },
    "auth/unauthorized-domain": { fr: "Domaine non autorisé.", ar: "المجال غير مصرح." },
    "SIGN_IN_CANCELLED": { fr: "Connexion annulée.", ar: "تم الإلغاء." },
    "PLAY_SERVICES_NOT_AVAILABLE": { fr: "Google Play Services non disponible.", ar: "خدمات Google Play غير متاحة." },
    "12501": { fr: "Connexion annulée.", ar: "تم الإلغاء." },
  };
  const entry = map[code];
  if (entry) return entry[lang];
  return lang === "ar" ? "فشل تسجيل الدخول." : "Échec de la connexion Google.";
}
