import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { doctors } from "../assets/assets";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

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
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const AppContext = createContext();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const clearError = () => setError(null);

  const retryOperation = async (
    operation,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY
  ) => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryOperation(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchUserAppointments(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create or update user document in Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: new Date(),
      }, { merge: true });

      return result.user;
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email/password
  const signUpWithEmail = async (email, password) => {
    try {
      setLoading(true);
      clearError();

      // Create the user account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        email: result.user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: "patient",
        displayName: email.split("@")[0], // Set a default display name
      });

      return result.user;
    } catch (error) {
      console.error("Email sign up error:", error);
      let errorMessage = "Failed to create account";
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered. Please try logging in.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please use at least 6 characters.";
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        lastLogin: new Date(),
      }, { merge: true });

      return result.user;
    } catch (error) {
      console.error("Email sign in error:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      clearError();
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Book appointment
  const bookAppointment = async (doctorId, appointmentData) => {
    if (!user) {
      throw new Error("Please sign in to book an appointment");
    }

    try {
      setLoading(true);
      clearError();

      // Create appointment document in Firestore
      const appointmentRef = await addDoc(collection(db, "appointments"), {
        ...appointmentData,
        userId: user.uid,
        doctorId,
        status: "pending",
        createdAt: new Date(),
      });

      // Fetch the updated appointments
      await fetchUserAppointments(user.uid);
      
      return appointmentRef;
    } catch (error) {
      console.error("Booking error:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user appointments
  const fetchUserAppointments = async (userId) => {
    try {
      setLoading(true);
      clearError();

      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(appointmentsQuery);
      const appointmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appointmentsList);
      return appointmentsList;
    } catch (error) {
      console.error("Fetch appointments error:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      clearError();

      await deleteDoc(doc(db, "appointments", appointmentId));
      await fetchUserAppointments(user.uid);
    } catch (error) {
      console.error("Cancel appointment error:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    doctors,
    appointments,
    currencySymbol,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout,
    clearError,
    bookAppointment,
    cancelAppointment,
    fetchUserAppointments,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node,
};

export default AppContextProvider;
