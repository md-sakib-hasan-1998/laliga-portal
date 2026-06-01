import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Admin seed ──────────────────────────────────────────────
export async function initAdmin() {
  try {
    // Try signing in first — if admin already exists this succeeds
    await signInWithEmailAndPassword(auth, "sakibhasn85@gmail.com", "Sakib1998!");
    const user = auth.currentUser;
    if (user) {
      // Make sure Firestore doc exists
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: "sakibhasn85@gmail.com",
          phone: "01706363514",
          name: "Admin Sakib",
          country: "Bangladesh",
          role: "admin",
          status: "approved",
          createdAt: serverTimestamp()
        });
      }
      await signOut(auth);
    }
  } catch (err) {
    if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
      // Admin doesn't exist yet — create them
      try {
        const cred = await createUserWithEmailAndPassword(auth, "sakibhasn85@gmail.com", "Sakib1998!");
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: "sakibhasn85@gmail.com",
          phone: "01706363514",
          name: "Admin Sakib",
          country: "Bangladesh",
          role: "admin",
          status: "approved",
          createdAt: serverTimestamp()
        });
        await signOut(auth);
      } catch (createErr) {
        console.warn("Admin init error:", createErr.message);
      }
    }
    // Any other error (e.g. wrong-password means admin exists but pwd changed) — ignore
  }
}

// ── Sign Up ─────────────────────────────────────────────────
export async function signUp(email, phone, name, country, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    phone,
    name,
    country,
    role: "user",
    status: "pending",
    createdAt: serverTimestamp()
  });
  await signOut(auth);
  return { success: true };
}

// ── Sign In ─────────────────────────────────────────────────
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  if (!snap.exists()) throw new Error("User record not found. Contact admin.");
  const userData = snap.data();
  if (userData.status === "banned") {
    await signOut(auth);
    throw new Error("Your account has been banned.");
  }
  if (userData.status === "pending") {
    await signOut(auth);
    throw new Error("Your account is pending admin approval.");
  }
  return userData;
}

// ── Sign Out ─────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
  window.location.href = getBasePath() + "index.html";
}

// ── Auth listener ────────────────────────────────────────────
export function onUserChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        callback(user, snap.exists() ? snap.data() : null);
      } catch {
        callback(user, null);
      }
    } else {
      callback(null, null);
    }
  });
}

// ── Change Password ──────────────────────────────────────────
export async function changePassword(currentPass, newPass) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in.");
  const credential = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPass);
}

// ── Admin/Mod helpers ────────────────────────────────────────
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => d.data());
}

export async function approveUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "approved" });
}

export async function banUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "banned" });
}

export async function promoteToModerator(uid) {
  await updateDoc(doc(db, "users", uid), { role: "moderator" });
}

export async function demoteToUser(uid) {
  await updateDoc(doc(db, "users", uid), { role: "user" });
}

export async function setLiveMatchLink(link, matchTitle) {
  await setDoc(doc(db, "settings", "liveMatch"), {
    link,
    matchTitle,
    active: link.trim().length > 0,
    updatedAt: serverTimestamp()
  });
}

export async function getLiveMatchLink() {
  const snap = await getDoc(doc(db, "settings", "liveMatch"));
  return snap.exists() ? snap.data() : null;
}

// ── Utility ──────────────────────────────────────────────────
function getBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../' : './';
}
