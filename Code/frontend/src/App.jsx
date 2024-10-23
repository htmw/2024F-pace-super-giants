import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import PreferenceQuestionnaire from "./components/PreferenceQuestionnaire";
import RestaurantDashboard from "./components/RestaurantDashboard";
import UserDashboard from "./components/UserDashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#F6F0E4]">
          <Navigation />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - Customer */}
            <Route
              path="/preferences"
              element={
                <ProtectedRoute requiredUserType="customer">
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

            {/* Protected routes - Restaurant */}
            <Route
              path="/Rdashboard"
              element={
                <ProtectedRoute requiredUserType="restaurant">
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 */}
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
      </AuthProvider>
    </Router>
  );
}

export default App;
