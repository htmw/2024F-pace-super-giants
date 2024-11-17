// src/components/Navigation.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Bell, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#990001] font-['Arvo']">
                DineWise
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-gray-700 hover:text-[#990001] font-['Arvo']"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Bell className="w-6 h-6 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Settings className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={logout}
                  className="h-8 w-8 rounded-full bg-[#990001] text-white flex items-center justify-center font-['Arvo']"
                >
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 text-white bg-[#990001] rounded-md hover:bg-[#800001] font-['Arvo']"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 text-[#990001] border border-[#990001] rounded-md hover:bg-[#990001] hover:text-white font-['Arvo']"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#990001] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-[#990001] font-['Arvo']"
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <button className="block px-3 py-2 text-gray-700 hover:text-[#990001] font-['Arvo']">
                    Notifications
                  </button>
                  <button className="block px-3 py-2 text-gray-700 hover:text-[#990001] font-['Arvo']">
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="block px-3 py-2 text-[#990001] hover:text-[#800001] font-['Arvo']"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-white bg-[#990001] rounded-md hover:bg-[#800001] font-['Arvo']"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-[#990001] border border-[#990001] rounded-md hover:bg-[#990001] hover:text-white font-['Arvo']"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
