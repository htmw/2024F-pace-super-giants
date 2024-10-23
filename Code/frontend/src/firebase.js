// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6J1E32jjcaDI_8tUIKs8U0Up7-xABY-o",
  authDomain: "dinewise-46d5d.firebaseapp.com",
  projectId: "dinewise-46d5d",
  storageBucket: "dinewise-46d5d.appspot.com",
  messagingSenderId: "673158971966",
  appId: "1:673158971966:web:12811992e7f6c3eb78476f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
