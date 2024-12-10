import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Star, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RestaurantMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurant } = location.state || {};

  // If no restaurant data, redirect back to dashboard
  if (!restaurant) {
    navigate("/Udashboard");
    return null;
  }

  // Filter menu items based on user preferences
  const filteredMenuItems = restaurant.menuItems.filter((item) => {
    // Get user preferences from localStorage or context
    const userPreferences =
      JSON.parse(localStorage.getItem(`preferences_${user?.uid}`)) || {};

    // Check if item matches dietary restrictions
    if (userPreferences.dietaryRestrictions?.length > 0) {
      const hasMatchingRestriction = item.dietaryRestrictions.some(
        (restriction) =>
          userPreferences.dietaryRestrictions.includes(restriction),
      );
      if (!hasMatchingRestriction) return false;
    }

    // Check spice preference
    if (userPreferences.spicePreference && item.isSpicy) {
      if (userPreferences.spicePreference === "mild") return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F6F0E4] p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/Udashboard")}
          className="flex items-center text-[#990001] hover:text-[#800001] mb-6 font-['Arvo']"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Restaurants
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-['Arvo'] mb-2">
                {restaurant.businessName}
              </h1>
              <p className="text-gray-600 font-['Arvo']">
                {restaurant.cuisine}
              </p>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-1" />
              <span className="text-lg font-['Arvo']">{restaurant.rating}</span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="font-['Arvo']">{restaurant.businessAddress}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span className="font-['Arvo']">{restaurant.businessPhone}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 font-['Arvo'] mb-6">
            Menu
          </h2>

          {filteredMenuItems.length === 0 ? (
            <p className="text-gray-600 font-['Arvo'] text-center py-8">
              No menu items match your dietary preferences.
            </p>
          ) : (
            <div className="grid gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 font-['Arvo']">
                          {item.name}
                        </h3>
                        {item.isSpicy && (
                          <Flame className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-gray-600 font-['Arvo'] mt-1">
                        {item.description}
                      </p>
                      {item.dietaryRestrictions.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {item.dietaryRestrictions.map((restriction) => (
                            <span
                              key={restriction}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-['Arvo']"
                            >
                              {restriction}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className="text-lg font-bold text-gray-900 font-['Arvo']">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
