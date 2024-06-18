// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import other Firebase services you need here

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUwhcBayxSe5VqFp99KfNskVMO5TbZ8pE",
  authDomain: "leclippers1.firebaseapp.com",
  projectId: "leclippers1",
  storageBucket: "leclippers1.appspot.com",
  messagingSenderId: "610913965194",
  appId: "1:610913965194:web:615f6e5c35e9e36dbf4973",
  measurementId: "G-458EGW6CYD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export any services you might need
export { app, analytics, storage, auth, db };
