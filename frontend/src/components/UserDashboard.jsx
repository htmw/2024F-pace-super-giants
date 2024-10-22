// src/components/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch user preferences
    const fetchPreferences = async () => {
      try {
        const prefsRef = collection(db, "users", user.uid, "preferences");
        const prefsSnap = await getDocs(prefsRef);
        if (!prefsSnap.empty) {
          setPreferences(prefsSnap.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
        setError("Failed to load preferences");
      }
    };

    // Listen to restaurant recommendations
    const fetchRecommendations = async () => {
      try {
        const restaurantsRef = collection(db, "restaurants");
        // You can implement your recommendation logic here
        // This is a simple example that fetches restaurants matching user preferences
        const q = query(
          restaurantsRef,
          where("cuisine", "in", preferences?.favoriteCategories || []),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const restaurantData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            rating: doc.data().ratings
              ? (
                  doc.data().ratings.reduce((a, b) => a + b, 0) /
                  doc.data().ratings.length
                ).toFixed(1)
              : "New",
          }));
          setRecommendations(restaurantData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations");
        setLoading(false);
      }
    };

    // Listen to user notifications
    const listenToNotifications = () => {
      const notificationsRef = collection(
        db,
        "users",
        user.uid,
        "notifications",
      );
      const q = query(notificationsRef, where("read", "==", false));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationData);
      });

      return unsubscribe;
    };

    fetchPreferences();
    const unsubscribeRecs = fetchRecommendations();
    const unsubscribeNotifs = listenToNotifications();

    return () => {
      unsubscribeRecs && unsubscribeRecs();
      unsubscribeNotifs && unsubscribeNotifs();
    };
  }, [user?.uid, preferences?.favoriteCategories]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F0E4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#990001] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Arvo']">Loading...</p>
        </div>
      </div>
    );
  }

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
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Bell className="w-6 h-6 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="h-8 w-8 rounded-full bg-[#990001] text-white flex items-center justify-center font-['Arvo']"
              >
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-['Arvo']">{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Arvo'] mb-2">
                Welcome back, {user?.firstName}!
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
            {recommendations.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={restaurant.imageUrl || "/api/placeholder/400/250"}
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
                      {restaurant.deliveryTime || "20-30 min"}
                    </span>
                  </div>
                  <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="w-full mt-4 px-4 py-2 bg-white border border-[#990001] text-[#990001] rounded-md hover:bg-[#990001] hover:text-white transition-colors duration-300 font-['Arvo'] flex items-center justify-center"
                  >
                    View Menu
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 font-['Arvo'] mb-4">
            Quick Filters
          </h2>
          <div className="flex flex-wrap gap-3">
            {preferences?.favoriteCategories?.map((cuisine) => (
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
