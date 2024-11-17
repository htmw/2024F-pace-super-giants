import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, Building2, User, Phone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [isCustomer, setIsCustomer] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    userType: "customer",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.userType === "customer" ? "/Udashboard" : "/Rdashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    setServerError("");
  };

  const handleUserTypeChange = (isCustomerType) => {
    setIsCustomer(isCustomerType);
    setFormData((prev) => ({
      ...prev,
      userType: isCustomerType ? "customer" : "restaurant",
    }));
    setErrors({});
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone number validation
    const phoneRegex = /^\+?\d{10,14}$/;

    // Customer-specific validations
    if (isCustomer) {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Business-specific validations
    if (!isCustomer) {
      if (!formData.businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.businessAddress?.trim()) {
        newErrors.businessAddress = "Business address is required";
      }
      if (!formData.businessPhone?.trim()) {
        newErrors.businessPhone = "Business phone is required";
      } else if (!phoneRegex.test(formData.businessPhone.replace(/\D/g, ""))) {
        newErrors.businessPhone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setServerError("");

      try {
        // Create auth user and get the user credential
        const { user: firebaseUser } = await register({
          email: formData.email.trim(),
          password: formData.password,
        });

        // Prepare user data for Firestore
        const userData = {
          email: formData.email.trim(),
          userType: formData.userType,
          createdAt: new Date().toISOString(),
          ...(isCustomer
            ? {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phone: formData.phone.replace(/\D/g, ""),
                preferencesCompleted: false,
              }
            : {
                businessName: formData.businessName.trim(),
                businessAddress: formData.businessAddress.trim(),
                businessPhone: formData.businessPhone.replace(/\D/g, ""),
              }),
        };

        // Save additional user data to Firestore
        await setDoc(doc(db, "users", firebaseUser.uid), userData);

        // Navigate based on user type
        if (formData.userType === "customer") {
          navigate("/preferences");
        } else {
          navigate("/Rdashboard");
        }
      } catch (error) {
        console.error("Registration error:", error);
        let errorMessage = "Registration failed. Please try again.";

        // Handle Firebase specific errors
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "An account with this email already exists.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Email/password accounts are not enabled. Please contact support.";
            break;
          case "auth/weak-password":
            errorMessage = "Please choose a stronger password.";
            break;
          default:
            if (error.message) {
              errorMessage = error.message;
            }
        }

        setServerError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F0E4] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 font-['Arvo']">
            DineWise
          </h1>
          <p className="mt-2 text-gray-600 font-['Arvo']">
            Join the future of dining
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {serverError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-['Arvo']">
                {serverError}
              </p>
            </div>
          )}

          <div className="flex space-x-4 mb-8">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md font-['Arvo'] transition-all ${
                isCustomer
                  ? "bg-[#990001] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => handleUserTypeChange(true)}
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
              onClick={() => handleUserTypeChange(false)}
              disabled={isLoading}
            >
              Restaurant
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isCustomer ? (
              // Customer Fields
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                      First Name
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        name="firstName"
                        required
                        disabled={isLoading}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                      <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                      Last Name
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        name="lastName"
                        required
                        disabled={isLoading}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                      <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      disabled={isLoading}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (234) 567-8900"
                    />
                    <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              // Restaurant Fields
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Business Name
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      name="businessName"
                      required
                      disabled={isLoading}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.businessName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      value={formData.businessName}
                      onChange={handleInputChange}
                    />
                    <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Business Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="businessAddress"
                      rows={3}
                      required
                      disabled={isLoading}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.businessAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.businessAddress && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Business Phone
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="tel"
                      name="businessPhone"
                      required
                      disabled={isLoading}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.businessPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (234) 567-8900"
                    />
                    <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessPhone}
                    </p>
                  )}
                </div>
              </>
            )}
            {/* Common Fields */}
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
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

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
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min. 8 characters"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  disabled={isLoading}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-gray-600 mt-4 font-['Arvo']">
              By registering, you agree to our{" "}
              <Link to="/terms" className="text-[#990001] hover:text-[#800001]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-[#990001] hover:text-[#800001]"
              >
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#990001] hover:bg-[#800001] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registering...
                </div>
              ) : (
                `Register as ${isCustomer ? "Customer" : "Restaurant"}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-['Arvo']">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#990001] hover:text-[#800001] font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
