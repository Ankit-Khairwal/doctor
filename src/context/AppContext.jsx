import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { assets } from "../assets/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState(assets.doctors || []);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser({ 
              ...currentUser, 
              ...userDoc.data(),
              uid: currentUser.uid, 
              email: currentUser.email 
            });
          } else {
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
        setUser(currentUser ? { uid: currentUser.uid, email: currentUser.email } : null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

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
      await setDoc(doc(db, "users", result.user.uid), { lastLogin: new Date() }, { merge: true });
      return result.user;
    } catch (error) {
      console.error("Email sign in error:", error);
      setError("Failed to sign in");
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
      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: "patient",
        displayName: email.split("@")[0],
      });
      return result.user;
    } catch (error) {
      console.error("Email sign up error:", error);
      
      // Handle specific Firebase error codes
      if (error.code === "auth/email-already-in-use") {
        const errorMessage = "This email is already registered. Please use a different email or sign in instead.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        setError("Failed to create account");
        throw error;
      }
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

  // Add the fetchAppointments function
  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      clearError();
      
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("userId", "==", user.uid)
      );
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsList = [];
      
      appointmentsSnapshot.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() });
      });
      
      setAppointments(appointmentsList);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    logout,
    doctors,
    appointments,
    fetchAppointments, // Export the function to make it available to other components
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
