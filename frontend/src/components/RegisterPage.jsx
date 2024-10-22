import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Building2, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isCustomer, setIsCustomer] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
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
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Add your registration logic here
      console.log("Form submitted:", formData);

      // Different navigation based on user type
      if (isCustomer) {
        navigate("/preferences");
      } else {
        navigate("/restaurant-dashboard"); // or wherever restaurants should go
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
          <div className="flex space-x-4 mb-8">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md font-['Arvo'] transition-all ${
                isCustomer
                  ? "bg-[#990001] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsCustomer(true)}
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
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
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
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
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
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
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
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.businessName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
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
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.businessAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
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
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.businessPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
                      value={formData.businessPhone}
                      onChange={handleInputChange}
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
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
                  value={formData.email}
                  onChange={handleInputChange}
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
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
                  value={formData.password}
                  onChange={handleInputChange}
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
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#990001] hover:bg-[#800001] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] font-['Arvo']"
            >
              Register as {isCustomer ? "Customer" : "Restaurant"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-['Arvo']">
              Already have an account?{" "}
              <a href="/login" className="text-[#990001] hover:text-[#800001]">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
