import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Building2, User } from "lucide-react";

const RegisterPage = () => {
  const [isCustomer, setIsCustomer] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessAddress: "",
    businessPhone: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your registration logic here
    console.log("Form submitted:", formData);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  name="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {!isCustomer && (
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
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                      value={formData.businessName}
                      onChange={handleInputChange}
                    />
                    <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Business Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="businessAddress"
                      rows={3}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
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
