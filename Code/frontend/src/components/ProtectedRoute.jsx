import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const fromDashboard = location.state?.fromDashboard;

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

  // Allow access to restaurant menu pages without redirection
  if (
    location.pathname.startsWith("/restaurant/") &&
    location.state?.restaurant
  ) {
    return children;
  }

  // Allow access to preferences page if coming from dashboard
  if (location.pathname === "/preferences" && fromDashboard) {
    return children;
  }

  // Check user type requirement
  if (requiredUserType && user.userType !== requiredUserType) {
    const redirectPath =
      user.userType === "customer" ? "/Udashboard" : "/Rdashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // Handle customer-specific routing
  if (user.userType === "customer") {
    // Force new users to complete preferences
    if (!user.preferencesCompleted && location.pathname !== "/preferences") {
      return <Navigate to="/preferences" replace />;
    }

    // Prevent accessing preferences page directly (must come from dashboard)
    if (
      location.pathname === "/preferences" &&
      !fromDashboard &&
      user.preferencesCompleted
    ) {
      return <Navigate to="/Udashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
