// Firebase Web SDK v10 (Modular ESM via gstatic CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqr8ScyLi1v9SyRjBLJQ2PR3b2zCCaAuQ",
  authDomain: "ramg-production-photography.firebaseapp.com",
  projectId: "ramg-production-photography",
  storageBucket: "ramg-production-photography.firebasestorage.app",
  messagingSenderId: "736091587090",
  appId: "1:736091587090:web:522256843266f0341a0ecb"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);

console.log("[Firebase] Initialized successfully. App Name:", app.name);

export { app, auth, db };
