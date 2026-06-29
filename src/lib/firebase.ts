import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlF2v-vdAv7DsXcWtilh-ZMGZgNo8KQoQ",
  authDomain: "thera-7b7e8.firebaseapp.com",
  projectId: "thera-7b7e8",
  storageBucket: "thera-7b7e8.firebasestorage.app",
  messagingSenderId: "1016559879201",
  appId: "1:1016559879201:web:31f9161aeb49277e958f60",
  measurementId: "G-97HQVW95EF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (uses default database)
export const db = initializeFirestore(app, {});
