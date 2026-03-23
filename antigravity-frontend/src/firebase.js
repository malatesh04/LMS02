// Firebase SDK initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAflBE4JcjnzYiHS9Gvyae9uEV77FhSs70",
  authDomain: "lms02-34551.firebaseapp.com",
  projectId: "lms02-34551",
  storageBucket: "lms02-34551.firebasestorage.app",
  messagingSenderId: "275734872482",
  appId: "1:275734872482:web:5802071b3cd1a0e9cef2fb",
  measurementId: "G-6REZRNJGYK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser/production)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Auth
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);

export default app;
