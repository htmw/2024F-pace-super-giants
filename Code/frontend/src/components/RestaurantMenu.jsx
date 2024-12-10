import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  Flame,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RestaurantMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurant, fromUserDashboard } = location.state || {};
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuItemsWithPricing, setMenuItemsWithPricing] = useState([]);

  // Only redirect if there's no restaurant data
  if (!restaurant) {
    navigate("/Udashboard", { replace: true });
    return null;
  }

  // Get user preferences from localStorage
  const getUserPreferences = () => {
    try {
      const preferences = localStorage.getItem(`preferences_${user?.uid}`);
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error("Error parsing preferences:", error);
      return {};
    }
  };

  // Calculate recommendation score for an item
  const calculateRecommendationScore = (item, userPreferences) => {
    let score = 0;

    if (
      userPreferences.dietaryRestrictions?.some((pref) =>
        item.dietaryRestrictions?.includes(pref),
      )
    ) {
      score += 3;
    }

    if (userPreferences.spicePreference === "hot" && item.isSpicy) {
      score += 2;
    }
    if (userPreferences.spicePreference === "mild" && !item.isSpicy) {
      score += 2;
    }

    if (userPreferences.favoriteCategories?.includes(item.category)) {
      score += 2;
    }

    return score;
  };

  // Enhanced dynamic pricing with randomization
  const calculateDynamicPrice = (basePrice, item) => {
    let multiplier = 1;
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Base time-of-day adjustments
    if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      multiplier += 0.1; // Peak hours: +10%
    }
    if (hour >= 21 || hour <= 5) {
      multiplier -= 0.15; // Late night: -15%
    }

    // Dynamic fluctuation based on 30-minute intervals
    const timeInterval = Math.floor(minutes / 30);
    const randomFactor = Math.sin(timeInterval + hour) * 0.05; // ±5% fluctuation
    multiplier += randomFactor;

    // Demand-based pricing
    const demandFactor = Math.sin(hour + minutes / 60) * 0.03; // ±3% based on time
    multiplier += demandFactor;

    // Special items adjustment
    if (item.category === "Specials") {
      multiplier += 0.05;
    }

    // Ensure minimum pricing
    multiplier = Math.max(0.8, multiplier); // Never go below 80% of base price

    return (basePrice * multiplier).toFixed(2);
  };

  // Process and filter menu items
  const processMenuItems = () => {
    const userPreferences = getUserPreferences();

    return restaurant.menuItems
      .filter((item) => {
        if (userPreferences.dietaryRestrictions?.length > 0) {
          const hasMatchingRestriction = item.dietaryRestrictions?.some(
            (restriction) =>
              userPreferences.dietaryRestrictions.includes(restriction),
          );
          if (!hasMatchingRestriction) return false;
        }

        if (userPreferences.spicePreference === "mild" && item.isSpicy) {
          return false;
        }

        return true;
      })
      .map((item) => ({
        ...item,
        recommendationScore: calculateRecommendationScore(
          item,
          userPreferences,
        ),
        dynamicPrice: calculateDynamicPrice(item.price, item),
        originalPrice: item.price,
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  };

  // Update time and prices every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  // Update menu items when time changes
  useEffect(() => {
    const processedItems = processMenuItems();
    setMenuItemsWithPricing(processedItems);
  }, [currentTime]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate time until next price update
  const getTimeUntilNextUpdate = () => {
    const minutes = currentTime.getMinutes();
    const nextUpdateMinutes = minutes >= 30 ? 60 - minutes : 30 - minutes;
    return `${nextUpdateMinutes} minute${nextUpdateMinutes !== 1 ? "s" : ""}`;
  };

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
          <div className="flex items-center text-gray-600 mb-2">
            <Phone className="w-4 h-4 mr-2" />
            <span className="font-['Arvo']">{restaurant.businessPhone}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-['Arvo']">
                Current time: {formatTime(currentTime)}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-['Arvo'] ml-6">
              Prices will update in: {getTimeUntilNextUpdate()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 font-['Arvo'] mb-6">
            Menu
          </h2>

          {menuItemsWithPricing.length === 0 ? (
            <p className="text-gray-600 font-['Arvo'] text-center py-8">
              No menu items match your dietary preferences.
            </p>
          ) : (
            <div className="grid gap-6">
              {menuItemsWithPricing.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-gray-200 last:border-0 pb-6 last:pb-0 ${
                    item.recommendationScore > 3
                      ? "bg-green-50 p-4 rounded-lg"
                      : ""
                  }`}
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
                        {item.recommendationScore > 3 && (
                          <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Recommended
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 font-['Arvo'] mt-1">
                        {item.description}
                      </p>
                      {item.dietaryRestrictions?.length > 0 && (
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
                    <div className="ml-4 text-right">
                      <span className="text-lg font-bold text-gray-900 font-['Arvo']">
                        ${item.dynamicPrice}
                      </span>
                      {item.dynamicPrice !== item.originalPrice.toFixed(2) && (
                        <div className="text-sm text-gray-500 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </div>
                      )}
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
