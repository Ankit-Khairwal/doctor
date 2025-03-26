import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const auth = getAuth(app);
export const db = getFirestore(app);

/* 
IMPORTANT NOTICE FOR FIREBASE AUTHENTICATION:

To fix the domain authorization issue, you need to add your domain 
(doctor-seven-hazel.vercel.app) to the OAuth redirect domains list in the Firebase console:

1. Go to Firebase console: https://console.firebase.google.com/
2. Select your project
3. Navigate to: Authentication -> Settings -> Authorized domains tab
4. Click "Add domain" and add: doctor-seven-hazel.vercel.app

This will allow Firebase authentication to work properly on your deployed site.
*/
