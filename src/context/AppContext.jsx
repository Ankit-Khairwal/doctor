import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { assets } from "../assets/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState(assets.doctors || []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({ ...user, ...userDoc.data() });
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create/update user document in Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: new Date(),
        role: "patient",
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

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        lastLogin: new Date()
      }, { merge: true });

      return result.user;
    } catch (error) {
      console.error("Email sign in error:", error);
      let errorMessage = "Failed to sign in";
      
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
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

  const signUpWithEmail = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        email: result.user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: "patient",
        displayName: email.split("@")[0],
      });

      return result.user;
    } catch (error) {
      console.error("Email sign up error:", error);
      let errorMessage = "Failed to create account";
      
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

  const bookAppointment = async (doctorId, appointmentData) => {
    try {
      setLoading(true);
      clearError();

      if (!user) {
        throw new Error("Please sign in to book an appointment");
      }

      // Check for existing appointment at the same time
      const appointmentsRef = collection(db, "appointments");
      const existingAppointments = query(
        appointmentsRef,
        where("doctorId", "==", doctorId),
        where("date", "==", appointmentData.date),
        where("timeSlot", "==", appointmentData.timeSlot)
      );

      const querySnapshot = await getDocs(existingAppointments);
      if (!querySnapshot.empty) {
        throw new Error("This time slot is already booked. Please select another time.");
      }

      // Create the appointment
      const appointment = {
        userId: user.uid,
        doctorId,
        patientName: user.displayName || user.email,
        patientEmail: user.email,
        ...appointmentData,
        status: "pending",
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "appointments"), appointment);
      return { id: docRef.id, ...appointment };
    } catch (error) {
      console.error("Booking error:", error);
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
    clearError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    bookAppointment,
    doctors,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
