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
} from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

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
      },
      (error) => {
        console.error("Auth state error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node,
};

export default AppContextProvider;
