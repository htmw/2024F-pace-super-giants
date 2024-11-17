import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const { verifyEmail, updateUserPassword } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyEmail(email);
      setStep(2);
    } catch (error) {
      console.error("Email verification error:", error);
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("Failed to verify email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await updateUserPassword(email, formData.password);
      navigate("/login", {
        state: {
          message:
            "Password successfully reset. Please login with your new password.",
        },
      });
    } catch (error) {
      console.error("Password update error:", error);
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F0E4] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 font-['Arvo']">
            Reset Password
          </h1>
          <p className="mt-2 text-gray-600 font-['Arvo']">
            {step === 1
              ? "Enter your email to reset your password"
              : "Create your new password"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 font-['Arvo']">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 font-['Arvo']"
                >
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="your@email.com"
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#990001] hover:bg-[#800001] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter new password"
                  />
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading || !formData.password || !formData.confirmPassword
                }
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#990001] hover:bg-[#800001] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[#990001] hover:text-[#800001] font-['Arvo'] flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
