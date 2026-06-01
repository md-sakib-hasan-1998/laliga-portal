// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR OWN FIREBASE PROJECT CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyA1BKTKympH4mll32A6nfvXyis8sBWy3Ao",
  authDomain: "laliga-app-7f290.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "laliga-app-7f290",
  storageBucket: "laliga-app-7f290.firebasestorage.app",
  messagingSenderId: "931741581003",
  appId: "1:931741581003:web:903bcdc224372082f4654e"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
