// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// yahan apna config paste karo:
const firebaseConfig = {
  apiKey: "AIzaSyB2pATSPaNzJ-cvA9Tz514QUnE7W4dlJgI",
  authDomain: "naploo-168a7.firebaseapp.com",
  projectId: "naploo-168a7",
  storageBucket: "naploo-168a7.firebasestorage.app",
  messagingSenderId: "419121679863",
  appId: "1:419121679863:web:9397612c3e863b8feeb2f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { firebaseConfig };
