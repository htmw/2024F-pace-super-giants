import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F0E4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#990001] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Arvo']">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but wrong type, redirect to appropriate dashboard
  if (requiredUserType && user.userType !== requiredUserType) {
    const redirectPath =
      user.userType === "customer" ? "/Udashboard" : "/Rdashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // For customer users, handle preferences completion check
  if (user.userType === "customer" && !user.preferencesCompleted) {
    // Allow access to preferences page
    if (location.pathname === "/preferences") {
      return children;
    }
    // Redirect to preferences if not completed
    return <Navigate to="/preferences" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
