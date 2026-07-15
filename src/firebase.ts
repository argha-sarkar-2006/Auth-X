import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHtpMNnGQIVpEXjekXiUVehgF9vxwuCcs",
  authDomain: "auth-d4d6f.firebaseapp.com",
  projectId: "auth-d4d6f",
  storageBucket: "auth-d4d6f.firebasestorage.app",
  messagingSenderId: "459758881982",
  appId: "1:459758881982:web:88f03e81a4b71ceaa1e2ef",
  measurementId: "G-CFPNXCZZPH"
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
