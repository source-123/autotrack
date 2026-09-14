import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  getDocs,
  FirestoreError,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export const COLLECTIONS = {
  vehicles: "vehicles",
  maintenances: "maintenances",
  insurances: "insurances",
  inspections: "inspections",
  reminders: "reminders",
} as const;

export type CollectionName = keyof typeof COLLECTIONS;

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

export async function saveDoc<T extends { id: string }>(
  collectionName: CollectionName,
  item: T
): Promise<void> {
  try {
    const { id, ...data } = item;
    await setDoc(doc(db, collectionName, id), sanitize(data), { merge: true });
  } catch (e) {
    console.error(`❌ saveDoc ${collectionName}:`, (e as FirestoreError).message);
  }
}

export async function removeDoc(
  collectionName: CollectionName,
  id: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (e) {
    console.error(`❌ removeDoc ${collectionName}:`, (e as FirestoreError).message);
  }
}

export async function fetchCollection<T>(
  collectionName: CollectionName
): Promise<T[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, collectionName), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
  } catch (e) {
    console.error(`❌ fetchCollection ${collectionName}:`, (e as FirestoreError).message);
    return [];
  }
}

/** Écoute uniquement les documents de l'utilisateur connecté */
export function subscribeCollection<T>(
  collectionName: CollectionName,
  onChange: (items: T[]) => void
): Unsubscribe {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onChange([]);
    return () => {};
  }

  const q = query(collection(db, collectionName), where("userId", "==", uid));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
      onChange(items);
    },
    (error: FirestoreError) => {
      console.error(`❌ subscribe ${collectionName}:`, error.message);
    }
  );
}
