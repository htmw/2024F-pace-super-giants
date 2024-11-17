import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Settings,
  Bell,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Sliders,
  Search,
  LogOut,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);

  // Categories for quick filters
  const categories = [
    "all",
    "Indian",
    "Italian",
    "Chinese",
    "Mexican",
    "Japanese",
    "American",
  ];

  useEffect(() => {
    if (!user?.uid) return;

    const fetchRestaurants = async () => {
      try {
        const restaurantsRef = collection(db, "restaurants");
        let q = query(restaurantsRef, limit(12));

        if (selectedCategory !== "all") {
          q = query(
            restaurantsRef,
            where("cuisine", "==", selectedCategory),
            limit(12),
          );
        }

        const querySnapshot = await getDocs(q);
        const restaurantData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Add default values for required fields
          businessName: doc.data().businessName || "Restaurant Name",
          businessAddress: doc.data().businessAddress || "Address Unavailable",
          businessPhone: doc.data().businessPhone || "Phone Unavailable",
          rating: (Math.random() * 2 + 3).toFixed(1), // Temporary random rating between 3-5
          cuisine: doc.data().cuisine || "Various Cuisine",
          deliveryTime: "30-45 min",
        }));

        setRestaurants(restaurantData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants");
        setLoading(false);
      }
    };

    // Listen to notifications
    const notificationsRef = collection(db, `users/${user.uid}/notifications`);
    const notificationsQuery = query(
      notificationsRef,
      where("read", "==", false),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationData);
    });

    fetchRestaurants();
    return () => unsubscribe();
  }, [user?.uid, selectedCategory]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    }
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.businessName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurant.businessAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F0E4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#990001] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Arvo']">
            Loading your recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F0E4]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#990001] font-['Arvo']">
                DineWise
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                    <div className="py-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-2 hover:bg-gray-50"
                        >
                          <p className="text-sm font-['Arvo']">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              notification.createdAt?.toDate(),
                            ).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 font-['Arvo']">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Arvo'] mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 font-['Arvo']">
                Discover new restaurants and explore your favorite cuisines
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

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#990001] focus:border-[#990001] font-['Arvo']"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-['Arvo'] ${
                    selectedCategory === category
                      ? "bg-[#990001] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-[#990001]"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 font-['Arvo']">
                    {restaurant.businessName}
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
                  <span className="font-['Arvo'] truncate">
                    {restaurant.businessAddress}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="font-['Arvo']">
                    {restaurant.businessPhone}
                  </span>
                </div>

                <Link
                  to={`/restaurant/${restaurant.id}`}
                  className="w-full mt-4 px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] transition-colors duration-300 font-['Arvo'] flex items-center justify-center"
                >
                  View Menu
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 font-['Arvo']">
              No restaurants found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
