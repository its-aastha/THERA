import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "triple-tine-0fj47",
  appId: "1:31949615311:web:782d072ec7bd8228f247ba",
  apiKey: "AIzaSyAQ3Flv5Fw_zjFpd2ng6aXzChLmivbiKuw",
  authDomain: "triple-tine-0fj47.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-fc167e9e-e8c0-4c00-a234-17904082318f",
  storageBucket: "triple-tine-0fj47.firebasestorage.app",
  messagingSenderId: "31949615311"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
