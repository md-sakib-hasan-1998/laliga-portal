import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc, collection,
  query, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Admin credentials (hardcoded admin)
const ADMIN_EMAIL = "sakibhasn85@gmail.com";
const ADMIN_PHONE = "01706363514";

export async function initAdmin() {
  // Check if admin exists
  const adminRef = doc(db, "users", "admin_sakib");
  const adminSnap = await getDoc(adminRef);
  if (!adminSnap.exists()) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, "Sakib1998!");
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        name: "Admin Sakib",
        country: "Bangladesh",
        role: "admin",
        status: "approved",
        createdAt: serverTimestamp()
      });
      await signOut(auth);
    } catch (e) {
      // Admin might already exist
    }
  }
}

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
  return { success: true, message: "Account created! Awaiting admin approval." };
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));
  const userData = userDoc.data();
  if (userData.status === "banned") {
    await signOut(auth);
    throw new Error("Your account has been banned.");
  }
  if (userData.status === "pending") {
    await signOut(auth);
    throw new Error("Your account is pending approval.");
  }
  return userData;
}

export async function logOut() {
  await signOut(auth);
  window.location.href = "/index.html";
}

export function onUserChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      callback(user, userDoc.exists() ? userDoc.data() : null);
    } else {
      callback(null, null);
    }
  });
}

export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}

export async function changePassword(currentPass, newPass) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPass);
}

// Admin/Moderator functions
export async function getAllUsers() {
  const q = query(collection(db, "users"));
  const snap = await getDocs(q);
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
    active: !!link,
    updatedAt: serverTimestamp()
  });
}

export async function getLiveMatchLink() {
  const snap = await getDoc(doc(db, "settings", "liveMatch"));
  return snap.exists() ? snap.data() : null;
}
