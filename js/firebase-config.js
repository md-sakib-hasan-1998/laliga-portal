// ============================================================
// STEP 1: FILL IN YOUR FIREBASE CONFIG HERE
// Get these values from: Firebase Console > Project Settings > Your Apps > Web App
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1BKTKympH4mll32A6nfvXyis8sBWy3Ao",
  authDomain: "laliga-app-7f290.firebaseapp.com",
  projectId: "laliga-app-7f290",
  storageBucket: "laliga-app-7f290.firebasestorage.app",
  messagingSenderId: "931741581003",
  appId: "1:931741581003:web:903bcdc224372082f4654e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
