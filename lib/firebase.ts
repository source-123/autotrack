import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCktOy6Yf0EeHPOLNC1GD39uJYmJd5RIwk",
  authDomain: "suivi-entretien-voiture.firebaseapp.com",
  databaseURL: "https://suivi-entretien-voiture-default-rtdb.firebaseio.com",
  projectId: "suivi-entretien-voiture",
  storageBucket: "suivi-entretien-voiture.firebasestorage.app",
  messagingSenderId: "791419730011",
  appId: "1:791419730011:web:86897074ebb100e87c277e",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
