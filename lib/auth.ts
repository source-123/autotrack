import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  Unsubscribe,
} from "firebase/auth";
import { auth } from "./firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return toAuthUser(cred.user);
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return toAuthUser(cred.user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(
  onChange: (user: AuthUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, (u) => {
    onChange(u ? toAuthUser(u) : null);
  });
}

function toAuthUser(u: User): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
  };
}

export function translateAuthError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "Cet email est déjà utilisé.",
    "auth/invalid-email": "Email invalide.",
    "auth/weak-password": "Mot de passe trop faible (6 caractères min).",
    "auth/user-not-found": "Aucun compte avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Email ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Réessaie plus tard.",
  };
  return map[code] || "Erreur inconnue. Réessaie.";
}
