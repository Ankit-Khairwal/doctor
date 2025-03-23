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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser({ 
              ...currentUser, 
              ...userDoc.data(),
              uid: currentUser.uid, // Ensure uid is always available
              email: currentUser.email // Ensure email is always available
            });
          } else {
            // If no user document exists yet, still set the user with auth data
            setUser({
              ...currentUser,
              uid: currentUser.uid,
              email: currentUser.email
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Still set basic user if there's an error fetching additional data
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
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
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          lastLogin: new Date(),
          role: "patient",
        }, { merge: true });
      } catch (dbError) {
        console.error("Error updating user document:", dbError);
        // Even if Firestore update fails, still return the user
      }

      return result.user;
    } catch (error) {
      console.error("Google sign in error:", error);
      let errorMessage = "Failed to sign in with Google";
      
      // Handle specific Google sign-in errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed before completing. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      }

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!email || !password) {
      const error = new Error("Email and password are required");
      setError(error.message);
      throw error;
    }
    
    try {
      setLoading(true);
      clearError();
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(userRef, {
          lastLogin: new Date()
        }, { merge: true });
      } catch (dbError) {
        console.error("Error updating last login:", dbError);
        // Even if Firestore update fails, still continue
      }

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
        case "auth/too-many-requests":
          errorMessage = "Too many failed login attempts. Please try again later.";
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
    if (!email || !password) {
      const error = new Error("Email and password are required");
      setError(error.message);
      throw error;
    }
    
    try {
      setLoading(true);
      clearError();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(userRef, {
          email: result.user.email,
          createdAt: new Date(),
          lastLogin: new Date(),
          role: "patient",
          displayName: email.split("@")[0],
        });
      } catch (dbError) {
        console.error("Error creating user document:", dbError);
        // Even if Firestore creation fails, still return the user
      }

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
