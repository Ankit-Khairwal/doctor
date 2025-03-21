import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { doctors } from "../assets/assets";
import {
  auth,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  doc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";

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

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect sign-in successful:", result.user);
          setUser(result.user);
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        setError(error.message);
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log("Auth state changed:", currentUser);
        setUser(currentUser);
        setLoading(false);
        setError(null);

        // Fetch appointments when user changes
        if (currentUser) {
          fetchUserAppointments(currentUser.uid);
        } else {
          setAppointments([]);
        }
      },
      (error) => {
        console.error("Auth state error:", error);
        setError("Authentication error. Please try signing in again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchUserAppointments = async (userId) => {
    try {
      setLoading(true);
      const fetchAppointments = async () => {
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const appointmentsList = [];
        querySnapshot.forEach((doc) => {
          appointmentsList.push({ id: doc.id, ...doc.data() });
        });

        return appointmentsList;
      };

      const appointmentsList = await retryOperation(fetchAppointments);
      setAppointments(appointmentsList);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (doctorId, dateTime, slotTime) => {
    try {
      if (!user) {
        throw new Error("Please sign in to book an appointment");
      }

      setLoading(true);
      setError(null);

      const createAppointment = async () => {
        // Format the date for storage
        const appointmentDate = new Date(dateTime);
        const formattedDate = `${appointmentDate.getDate()}_${
          appointmentDate.getMonth() + 1
        }_${appointmentDate.getFullYear()}`;

        // Check if slot is already booked
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("doctorId", "==", doctorId),
          where("date", "==", formattedDate),
          where("time", "==", slotTime)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          throw new Error(
            "This slot is already booked. Please select another time."
          );
        }

        // Create new appointment
        const appointmentData = {
          userId: user.uid,
          doctorId,
          date: formattedDate,
          time: slotTime,
          status: "pending",
          createdAt: new Date().toISOString(),
          doctorInfo: doctors.find((doc) => doc._id === doctorId),
          patientInfo: {
            name: user.displayName || "Anonymous",
            email: user.email,
            photoURL: user.photoURL,
          },
        };

        const docRef = await addDoc(appointmentsRef, appointmentData);
        return { docRef, appointmentData };
      };

      const { docRef, appointmentData } = await retryOperation(
        createAppointment
      );

      // Add the new appointment to state
      setAppointments((prev) => [
        ...prev,
        { id: docRef.id, ...appointmentData },
      ]);

      return { success: true, appointmentId: docRef.id };
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "You don't have permission to book appointments. Please sign in again."
          : error.message || "Failed to book appointment";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      setError(null);

      const cancelOp = async () => {
        await deleteDoc(doc(db, "appointments", appointmentId));
      };

      await retryOperation(cancelOp);

      // Remove the appointment from state
      setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));

      return { success: true };
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "You don't have permission to cancel this appointment."
          : error.message || "Failed to cancel appointment";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting Google sign in...");
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters");
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(result.user);
    } catch (error) {
      console.error("Error signing up with email:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection");
          break;
        default:
          setError(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in with email:", error);
      switch (error.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection");
          break;
        default:
          setError(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    doctors,
    currencySymbol,
    user,
    loading,
    error,
    clearError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout,
    appointments,
    bookAppointment,
    cancelAppointment,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node,
};

export default AppContextProvider;
