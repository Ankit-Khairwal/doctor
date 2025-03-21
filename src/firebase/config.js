import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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

// Configure Google Provider with additional parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  // Handle third-party cookie issues
  auth_type: "reauthenticate",
  // Use redirect instead of popup for better compatibility
  display: "redirect",
});

export {
  auth,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
