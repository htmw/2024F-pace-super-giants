import React from "react";
import {
  Settings,
  Bell,
  UtensilsCrossed,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  // Mock data for recommended restaurants
  const recommendedRestaurants = [
    {
      id: 1,
      name: "Pizza Paradise",
      cuisine: "Italian",
      rating: 4.8,
      location: "123 Main St",
      deliveryTime: "20-30 min",
      image: "/api/placeholder/400/250",
    },
    {
      id: 2,
      name: "Sushi Supreme",
      cuisine: "Japanese",
      rating: 4.6,
      location: "456 Oak Ave",
      deliveryTime: "25-35 min",
      image: "/api/placeholder/400/250",
    },
    {
      id: 3,
      name: "Taco Fiesta",
      cuisine: "Mexican",
      rating: 4.7,
      location: "789 Pine St",
      deliveryTime: "15-25 min",
      image: "/api/placeholder/400/250",
    },
    {
      id: 4,
      name: "Curry House",
      cuisine: "Indian",
      rating: 4.9,
      location: "321 Elm St",
      deliveryTime: "30-40 min",
      image: "/api/placeholder/400/250",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F0E4]">
      {/* Top Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#990001] font-['Arvo']">
                DineWise
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <div className="h-8 w-8 rounded-full bg-[#990001] text-white flex items-center justify-center font-['Arvo']">
                JD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Arvo'] mb-2">
                Welcome back, John!
              </h1>
              <p className="text-gray-600 font-['Arvo']">
                Here are some restaurants we think you'll love
              </p>
            </div>
            <Link
              to="/preferences"
              className="flex items-center px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] font-['Arvo']"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Update Preferences
            </Link>
          </div>
        </div>

        {/* Recommended Restaurants */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 font-['Arvo'] mb-4">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 font-['Arvo']">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600 font-['Arvo']">
                        {restaurant.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-['Arvo'] mb-2">
                    {restaurant.cuisine}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="font-['Arvo']">{restaurant.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-['Arvo']">
                      {restaurant.deliveryTime}
                    </span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-white border border-[#990001] text-[#990001] rounded-md hover:bg-[#990001] hover:text-white transition-colors duration-300 font-['Arvo'] flex items-center justify-center">
                    View Menu
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Preferences Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 font-['Arvo'] mb-4">
            Quick Filters
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Italian",
              "Japanese",
              "Mexican",
              "Indian",
              "Chinese",
              "Thai",
            ].map((cuisine) => (
              <button
                key={cuisine}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-[#990001] hover:text-[#990001] font-['Arvo']"
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
