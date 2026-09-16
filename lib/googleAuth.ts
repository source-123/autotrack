import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "./firebase";

// Nécessaire pour fermer le navigateur après redirection
WebBrowser.maybeCompleteAuthSession();

/**
 * ⚙️ CONFIGURATION GOOGLE SIGN-IN
 * Remplace par tes vrais Client IDs depuis Google Cloud Console
 */
export const GOOGLE_CONFIG = {
  // Client ID Web (obligatoire - fonctionne sur web ET mobile via redirect)
  webClientId: "410867386758-me611h1luu0dn437ajnn7sogn6g8teiq.apps.googleusercontent.com",
  // Client ID Android (optionnel, pour build natif)
  androidClientId: "410867386758-k00vuu6atos3do2otf4nhau5guaj8su8.apps.googleusercontent.com",
  // Client ID iOS (optionnel)
  iosClientId: "REMPLACE_PAR_TON_IOS_CLIENT_ID.apps.googleusercontent.com",
};

/**
 * Hook Google Sign-In (pour mobile natif).
 * Sur web, on utilise signInWithPopup à la place.
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
  });

  return { request, response, promptAsync };
}

/**
 * Connexion Google sur WEB avec popup Firebase.
 */
export async function signInWithGoogleWeb(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(auth, provider);
}

/**
 * Connexion Google sur MOBILE avec credential.
 */
export async function signInWithGoogleMobile(idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}

/**
 * Traduit les erreurs Google en messages FR/AR.
 */
export function translateGoogleError(code: string, lang: "fr" | "ar" = "fr"): string {
  const map: Record<string, { fr: string; ar: string }> = {
    "auth/popup-closed-by-user": {
      fr: "Connexion annulée.",
      ar: "تم إلغاء تسجيل الدخول.",
    },
    "auth/popup-blocked": {
      fr: "Popup bloquée. Autorise les popups pour ce site.",
      ar: "تم حظر النافذة المنبثقة. اسمح بها.",
    },
    "auth/cancelled-popup-request": {
      fr: "Connexion annulée.",
      ar: "تم إلغاء الطلب.",
    },
    "auth/account-exists-with-different-credential": {
      fr: "Un compte existe déjà avec cet email.",
      ar: "يوجد حساب بهذا البريد بالفعل.",
    },
    "auth/network-request-failed": {
      fr: "Erreur réseau. Vérifie ta connexion.",
      ar: "خطأ في الشبكة. تحقق من اتصالك.",
    },
  };
  const entry = map[code];
  if (entry) return entry[lang];
  return lang === "ar" ? "فشل تسجيل الدخول عبر Google." : "Échec de la connexion Google.";
}
