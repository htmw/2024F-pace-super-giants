// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();

          // Set user data in state
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData,
          });

          // Route users based on type
          if (userData.userType === "restaurant") {
            // Restaurant users go directly to their dashboard
            navigate("/Rdashboard");
          } else if (userData.userType === "customer") {
            // Customers go to preferences if not completed, otherwise dashboard
            if (!userData.preferencesCompleted) {
              navigate("/preferences");
            } else {
              navigate("/Udashboard");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to load user data");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const login = async (credentials) => {
    try {
      setError(null);
      const { email, password, userType } = credentials;

      // Handle email/password login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      // Verify user type matches
      if (userData.userType !== userType) {
        throw new Error(
          `Invalid account type. Please use the correct login option for ${userType} accounts.`,
        );
      }

      // Set user data in state
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        ...userData,
      });

      return userCredential;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code) || error.message;
      setError(errorMessage);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (!userDoc.exists()) {
        // New user - set default data as customer
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          userType: "customer", // Google login is only for customers
          preferencesCompleted: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Set user data in state
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        ...userDoc.data(),
      });

      return result;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const { email, password, ...otherData } = userData;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        ...otherData,
        createdAt: new Date().toISOString(),
      });

      // Set user data in state
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        ...otherData,
      });

      return userCredential;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      navigate("/login");
    } catch (error) {
      setError("Failed to log out");
      throw error;
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
