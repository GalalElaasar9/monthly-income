import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// Hardcoded default config from the user's project with fallback to env
export const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDU1Dlum_Joc9trq8u1z_fpTJEZA3z6g9o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-income-82ba6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-income-82ba6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-income-82ba6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "739411704729",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:739411704729:web:44bf7a799f32b5578b7108",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BBXG2N8C9B"
};

let app = null;
let auth = null;
let db = null;

try {
  app = getApps().length === 0 ? initializeApp(defaultFirebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.error('Firebase initialization error:', err);
}

export { app, auth, db };

export const isFirebaseConfigured = () => {
  return !!(auth && db);
};

// Cloud Sync Helpers
export const syncUserDataToCloud = async (uid, data) => {
  if (!db || !uid) return false;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        ...data,
        lastUpdated: serverTimestamp()
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Failed to sync data to Firestore:', err);
    throw err;
  }
};

export const fetchUserDataFromCloud = async (uid) => {
  if (!db || !uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch from Firestore:', err);
    throw err;
  }
};

export const subscribeToCloudData = (uid, onDataUpdate) => {
  if (!db || !uid) return () => {};
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onDataUpdate(docSnap.data());
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
    }
  );
};
