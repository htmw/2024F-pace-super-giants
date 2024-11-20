import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData,
          });
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
  }, []);

  // Handle navigation based on user state
  useEffect(() => {
    if (!loading && user) {
      const from = location.state?.from?.pathname;

      // Don't redirect if we're already on the preferences page
      if (location.pathname === "/preferences") {
        return;
      }

      // Handle redirects based on user type and preferences
      if (user.userType === "restaurant") {
        navigate("/Rdashboard", { replace: true });
      } else if (user.userType === "customer") {
        if (!user.preferencesCompleted) {
          navigate("/preferences", { replace: true });
        } else {
          navigate(from || "/Udashboard", { replace: true });
        }
      }
    }
  }, [user, loading, navigate, location]);

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
      case "auth/requires-recent-login":
        return "Please log in again to update your password.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const { email, password, userType } = credentials;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      if (userData.userType !== userType) {
        throw new Error(
          `Invalid account type. Please use the correct login option for ${userType} accounts.`,
        );
      }

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

      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          userType: "customer",
          preferencesCompleted: false,
          createdAt: new Date().toISOString(),
        });
      }

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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        ...otherData,
        createdAt: new Date().toISOString(),
      });

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

  const verifyEmail = async (email) => {
    try {
      setError(null);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("auth/user-not-found");
      }

      return true;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const updateUserPassword = async (email, newPassword) => {
    try {
      setError(null);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        await signInWithEmailAndPassword(auth, email, newPassword);
      }

      await updatePassword(currentUser, newPassword);

      return true;
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
      navigate("/login", { replace: true });
    } catch (error) {
      setError("Failed to log out");
      throw error;
    }
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    verifyEmail,
    updateUserPassword,
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

export default AuthContext;
