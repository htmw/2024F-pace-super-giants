// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can replace this with a proper loading component
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F0E4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#990001] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Arvo']">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredUserType && user.userType !== requiredUserType) {
    // Redirect to appropriate dashboard if wrong user type
    const redirectPath =
      user.userType === "customer" ? "/Udashboard" : "/Rdashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
