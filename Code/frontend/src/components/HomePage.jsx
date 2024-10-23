// src/components/HomePage.jsx
import { Link } from "react-router-dom";

const HomePage = () => (
  <div className="min-h-screen bg-[#F6F0E4] flex flex-col items-center justify-center p-4">
    <h1 className="text-5xl font-bold text-gray-900 mb-6 text-center font-['Arvo']">
      Welcome to DineWise
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl text-center mb-8 font-['Arvo']">
      Experience personalized dining with AI-driven menu recommendations and
      dynamic pricing
    </p>
    <div className="flex space-x-4">
      <Link
        to="/register"
        className="px-6 py-3 text-white bg-[#990001] rounded-md hover:bg-[#800001] font-['Arvo']"
      >
        Get Started
      </Link>
      <Link
        to="/menu"
        className="px-6 py-3 text-[#990001] border border-[#990001] rounded-md hover:bg-[#990001] hover:text-white font-['Arvo']"
      >
        Explore Menu
      </Link>
    </div>
  </div>
);

export default HomePage;
