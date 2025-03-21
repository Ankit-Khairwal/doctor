import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-7rFyGAB9w6_-rePNVkcawUeaOQpoKII",
  authDomain: "doctor-6a04e.firebaseapp.com",
  projectId: "doctor-6a04e",
  storageBucket: "doctor-6a04e.appspot.com",
  messagingSenderId: "627869831116",
  appId: "1:627869831116:web:0b2bf58f185c300560d769",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log("Persistence failed: Multiple tabs open");
    } else if (err.code === "unimplemented") {
      // The current browser doesn't support persistence
      console.log("Persistence not supported by browser");
    }
  });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

// Configure Google Provider with additional parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export {
  auth,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  deleteDoc,
};
