import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    loginWithGoogle,
    isAuthenticated,
    user,
    error: authError,
  } = useAuth();

  const [isCustomer, setIsCustomer] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.userType === "restaurant"
          ? "/Rdashboard" // Restaurant users always go to restaurant dashboard
          : user.preferencesCompleted
            ? "/Udashboard" // Customers with preferences go to user dashboard
            : "/preferences"; // New customers go to preferences
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Add userType to login credentials
      const credentials = {
        ...formData,
        userType: isCustomer ? "customer" : "restaurant",
      };

      await login(credentials);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isCustomer) {
      setError("Google login is only available for customers");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F0E4] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 font-['Arvo']">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600 font-['Arvo']">
            Sign in to your{" "}
            {isCustomer ? "DineWise account" : "restaurant dashboard"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Error Messages */}
          {(error || authError) && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-['Arvo']">
                {error || authError}
              </p>
            </div>
          )}

          {/* User Type Toggle */}
          <div className="flex space-x-4 mb-8">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md font-['Arvo'] transition-all ${
                isCustomer
                  ? "bg-[#990001] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsCustomer(true)}
              disabled={isLoading}
            >
              Customer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md font-['Arvo'] transition-all ${
                !isCustomer
                  ? "bg-[#990001] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsCustomer(false)}
              disabled={isLoading}
            >
              Restaurant
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder={
                    isCustomer ? "your@email.com" : "restaurant@email.com"
                  }
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={isLoading}
                  className="h-4 w-4 text-[#990001] focus:ring-[#990001] border-gray-300 rounded disabled:cursor-not-allowed"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 font-['Arvo']"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-['Arvo'] text-[#990001] hover:text-[#800001]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm{/* Submit Button Continued */}
                            font-medium text-white bg-[#990001] hover:bg-[#800001] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Google Login - Only show for customers */}
            {isCustomer && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 font-['Arvo']">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="h-5 w-5 mr-2"
                    />
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-['Arvo']">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#990001] hover:text-[#800001] font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
