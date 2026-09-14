import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  getDocs,
  FirestoreError,
} from "firebase/firestore";
import { db } from "./firebase";

export const COLLECTIONS = {
  vehicles: "vehicles",
  maintenances: "maintenances",
  insurances: "insurances",
  inspections: "inspections",
  reminders: "reminders",
} as const;

export type CollectionName = keyof typeof COLLECTIONS;

/**
 * Nettoie récursivement un objet :
 * - Supprime les clés dont la valeur est `undefined`
 * - Firestore n'accepte pas les valeurs undefined
 */
function sanitize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((v) => sanitize(v)).filter((v) => v !== undefined) as T;
  }
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      out[k] = sanitize(v);
    }
    return out;
  }
  return obj;
}

/** Sauvegarde ou met à jour un document */
export async function saveDoc<T extends { id: string }>(
  collectionName: CollectionName,
  item: T
): Promise<void> {
  try {
    const { id, ...data } = item;
    const cleanData = sanitize(data);
    await setDoc(doc(db, collectionName, id), cleanData, { merge: true });
  } catch (e) {
    const err = e as FirestoreError;
    console.error(`❌ saveDoc ${collectionName}:`, err.message);
  }
}

/** Supprime un document */
export async function removeDoc(
  collectionName: CollectionName,
  id: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (e) {
    const err = e as FirestoreError;
    console.error(`❌ removeDoc ${collectionName}:`, err.message);
  }
}

/** Récupère tous les documents d'une collection (one-shot) */
export async function fetchCollection<T>(
  collectionName: CollectionName
): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
  } catch (e) {
    const err = e as FirestoreError;
    console.error(`❌ fetchCollection ${collectionName}:`, err.message);
    return [];
  }
}

/** Écoute en temps réel une collection */
export function subscribeCollection<T>(
  collectionName: CollectionName,
  onChange: (items: T[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, collectionName),
    (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
      onChange(items);
    },
    (error: FirestoreError) => {
      console.error(`❌ subscribe ${collectionName}:`, error.message);
    }
  );
}
