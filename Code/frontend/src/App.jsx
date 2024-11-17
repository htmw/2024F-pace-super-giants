import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import ForgotPassword from "./components/ForgotPassword";
import PreferenceQuestionnaire from "./components/PreferenceQuestionnaire";
import RestaurantDashboard from "./components/RestaurantDashboard";
import UserDashboard from "./components/UserDashboard";

const AppContent = () => {
  const location = useLocation();
  const noNavRoutes = [
    "/Rdashboard",
    "/login",
    "/register",
    "/forgot-password",
    "/preferences",
    "/Udashboard",
  ];
  const shouldShowNavigation = !noNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F6F0E4]">
      {shouldShowNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <PreferenceQuestionnaire />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Udashboard"
          element={
            <ProtectedRoute requiredUserType="customer">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Rdashboard"
          element={
            <ProtectedRoute requiredUserType="restaurant">
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 font-['Arvo']">
                  404 - Page Not Found
                </h1>
                <p className="text-gray-600 mb-8 font-['Arvo']">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="text-[#990001] hover:text-[#800001] font-['Arvo']"
                >
                  Go back home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
