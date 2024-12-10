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
  ShoppingCart,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RestaurantMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurant } = location.state || {};
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuItemsWithPricing, setMenuItemsWithPricing] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    dietaryRestrictions: [],
    spicePreference: "no_preference",
    favoriteCategories: [],
  });

  // Only redirect if there's no restaurant data
  if (!restaurant) {
    navigate("/Udashboard", { replace: true });
    return null;
  }

  // Load user preferences from localStorage
  const loadUserPreferences = () => {
    try {
      const preferences = localStorage.getItem(`preferences_${user?.uid}`);
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error("Error parsing preferences:", error);
      return {};
    }
  };

  // Save user preferences to localStorage
  const saveUserPreferences = (preferences) => {
    localStorage.setItem(
      `preferences_${user?.uid}`,
      JSON.stringify(preferences),
    );
  };

  // Load preferences on initial mount
  useEffect(() => {
    const prefs = loadUserPreferences();
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  }, [user?.uid]);

  // Handle preference changes
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      // For dietaryRestrictions and favoriteCategories (assuming these as multi-select options)
      setUserPreferences((prev) => {
        const updatedArray = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...updatedArray, value] };
        } else {
          return {
            ...prev,
            [name]: updatedArray.filter((item) => item !== value),
          };
        }
      });
    } else {
      setUserPreferences((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save preferences when they change
  useEffect(() => {
    saveUserPreferences(userPreferences);
  }, [userPreferences]);

  // Calculate recommendation score for an item based on preferences
  const calculateRecommendationScore = (item, userPreferences) => {
    let score = 0;

    // Match dietary restrictions if set
    if (userPreferences.dietaryRestrictions?.length > 0) {
      const hasMatchingRestriction = userPreferences.dietaryRestrictions.some(
        (pref) => item.dietaryRestrictions?.includes(pref),
      );
      if (hasMatchingRestriction) {
        score += 3;
      } else {
        // If it doesn't match any dietary restriction, consider it less recommended
        return -1;
      }
    }

    // Match spice preference
    if (userPreferences.spicePreference === "hot" && item.isSpicy) {
      score += 2;
    } else if (userPreferences.spicePreference === "mild" && !item.isSpicy) {
      score += 2;
    } else if (userPreferences.spicePreference === "no_preference") {
      // no penalty or bonus
    } else {
      // If user wants mild and item is spicy (or vice versa), it might be less suitable
      // Not explicitly penalized since we handle filtering in logic below
    }

    // Match favorite categories
    if (userPreferences.favoriteCategories?.includes(item.category)) {
      score += 2;
    }

    return score;
  };

  // Calculate dynamic price
  const calculateDynamicPrice = (basePrice, item) => {
    let multiplier = 1;
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Peak hours pricing (e.g., lunch 12-14, dinner 18-20)
    if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      multiplier += 0.1; // 10% increase during peak hours
    }

    // Late night discount (21:00 to 05:00)
    if (hour >= 21 || hour <= 5) {
      multiplier -= 0.15; // 15% discount during late hours
    }

    // Dynamic fluctuation based on 30-minute intervals
    const timeInterval = Math.floor(minutes / 30);
    const randomFactor = Math.sin(timeInterval + hour) * 0.05;
    multiplier += randomFactor;

    // Demand-based pricing using a sine wave over time (example)
    const demandFactor = Math.sin(hour + minutes / 60) * 0.03;
    multiplier += demandFactor;

    // Special items markup
    if (item.category === "Specials") {
      multiplier += 0.05;
    }

    // Ensure a minimum multiplier
    multiplier = Math.max(0.8, multiplier);

    return (basePrice * multiplier).toFixed(2);
  };

  // Filter and process menu items based on user preferences
  const processMenuItems = () => {
    return restaurant.menuItems
      .filter((item) => {
        // If dietary restrictions are set, item must match at least one
        if (userPreferences.dietaryRestrictions?.length > 0) {
          const matchesRestriction = userPreferences.dietaryRestrictions.some(
            (pref) => item.dietaryRestrictions?.includes(pref),
          );
          if (!matchesRestriction) return false;
        }

        // If spice preference is mild and item is spicy, exclude
        if (userPreferences.spicePreference === "mild" && item.isSpicy) {
          return false;
        }

        // If spice preference is hot and item is not spicy, exclude
        if (userPreferences.spicePreference === "hot" && !item.isSpicy) {
          return false;
        }

        return true;
      })
      .map((item) => {
        const score = calculateRecommendationScore(item, userPreferences);
        return {
          ...item,
          recommendationScore: score,
          dynamicPrice: calculateDynamicPrice(item.price, item),
          originalPrice: item.price,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  };

  // Cart management
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const getCartTotal = () => {
    return cart
      .reduce(
        (total, item) => total + parseFloat(item.dynamicPrice) * item.quantity,
        0,
      )
      .toFixed(2);
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find((item) => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  // Update current time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Reprocess items whenever current time or preferences change
  useEffect(() => {
    const processedItems = processMenuItems();
    setMenuItemsWithPricing(processedItems);
  }, [currentTime, userPreferences]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeUntilNextUpdate = () => {
    const minutes = currentTime.getMinutes();
    const nextUpdateMinutes = minutes >= 30 ? 60 - minutes : 30 - minutes;
    return `${nextUpdateMinutes} minute${nextUpdateMinutes !== 1 ? "s" : ""}`;
  };

  // Cart UI Components
  const CartButton = () => (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-8 right-8 bg-[#990001] text-white p-4 rounded-full shadow-lg hover:bg-[#800001]"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-[#990001] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </div>
    </button>
  );

  const CartSidebar = () => (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ${
        isCartOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-['Arvo']">
            Your Order
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center font-['Arvo']">
              Your cart is empty
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-['Arvo'] font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500 font-['Arvo']">
                      ${item.dynamicPrice} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-['Arvo'] w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 p-1 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-4">
              <span className="font-['Arvo'] font-medium">Total:</span>
              <span className="font-['Arvo'] font-bold">${getCartTotal()}</span>
            </div>
            <button
              onClick={() => {
                // Handle checkout logic here
                alert("Proceeding to checkout...");
              }}
              className="w-full bg-[#990001] text-white py-3 rounded-lg hover:bg-[#800001] font-['Arvo']"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MenuItemAddToCart = ({ item }) => {
    const quantity = getItemQuantityInCart(item.id);

    return (
      <div className="mt-2 flex items-center gap-2">
        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateQuantity(item.id, -1)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="font-['Arvo'] w-8 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, 1)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="text-sm bg-[#990001] text-white px-3 py-1 rounded-lg hover:bg-[#800001] font-['Arvo'] flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </button>
        )}
      </div>
    );
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

        {/* Preferences Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-['Arvo'] mb-4">
            Your Preferences
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block mb-2 font-['Arvo'] font-medium">
                Dietary Restrictions:
              </label>
              <div className="flex gap-4">
                {/* Example dietary restrictions: */}
                <label className="flex items-center gap-2 font-['Arvo'] text-sm">
                  <input
                    type="checkbox"
                    name="dietaryRestrictions"
                    value="Vegan"
                    checked={userPreferences.dietaryRestrictions.includes(
                      "Vegan",
                    )}
                    onChange={handlePreferenceChange}
                  />
                  Vegan
                </label>
                <label className="flex items-center gap-2 font-['Arvo'] text-sm">
                  <input
                    type="checkbox"
                    name="dietaryRestrictions"
                    value="Vegetarian"
                    checked={userPreferences.dietaryRestrictions.includes(
                      "Vegetarian",
                    )}
                    onChange={handlePreferenceChange}
                  />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2 font-['Arvo'] text-sm">
                  <input
                    type="checkbox"
                    name="dietaryRestrictions"
                    value="Gluten-Free"
                    checked={userPreferences.dietaryRestrictions.includes(
                      "Gluten-Free",
                    )}
                    onChange={handlePreferenceChange}
                  />
                  Gluten-Free
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-['Arvo'] font-medium">
                Spice Preference:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-['Arvo'] text-sm">
                  <input
                    type="radio"
                    name="spicePreference"
                    value="mild"
                    checked={userPreferences.spicePreference === "mild"}
                    onChange={handlePreferenceChange}
                  />
                  Mild
                </label>
                <label className="flex items-center gap-2 font-['Arvo'] text-sm">
                  <input
                    type="radio"
                    name="spicePreference"
                    value="hot"
                    checked={userPreferences.spicePreference === "hot"}
                    onChange={handlePreferenceChange}
                  />
                  Hot
                </label>
                <label className="flex items-center gap-2 font-['Arvo'] text-sm">
                  <input
                    type="radio"
                    name="spicePreference"
                    value="no_preference"
                    checked={
                      userPreferences.spicePreference === "no_preference"
                    }
                    onChange={handlePreferenceChange}
                  />
                  No Preference
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-['Arvo'] font-medium">
                Favorite Categories:
              </label>
              <div className="flex gap-4 flex-wrap">
                {/* Example categories: */}
                {[
                  "Appetizer",
                  "Main Course",
                  "Dessert",
                  "Beverages",
                  "Specials",
                ].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 font-['Arvo'] text-sm"
                  >
                    <input
                      type="checkbox"
                      name="favoriteCategories"
                      value={cat}
                      checked={userPreferences.favoriteCategories.includes(cat)}
                      onChange={handlePreferenceChange}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

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
                      <MenuItemAddToCart item={item} />
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

      {/* Cart Button and Sidebar */}
      <CartButton />
      <CartSidebar />

      {/* Backdrop when cart is open */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
};

export default RestaurantMenu;
