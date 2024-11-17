import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, ChevronRight } from "lucide-react";

const RestaurantRecommendations = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantsRef = collection(db, "restaurants");
        const q = query(restaurantsRef, limit(8));

        const querySnapshot = await getDocs(q);
        const restaurantData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          businessName: doc.data().businessName || "Restaurant Name",
          businessAddress: doc.data().businessAddress || "Restaurant Address",
          businessPhone: doc.data().businessPhone || "Phone Number",
        }));

        setRestaurants(restaurantData);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-[#990001] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 font-['Arvo']">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Arvo']">
              {restaurant.businessName}
            </h3>

            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
              <p className="text-sm text-gray-600 font-['Arvo']">
                {restaurant.businessAddress}
              </p>
            </div>

            <div className="flex items-center mb-4">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              <p className="text-sm text-gray-600 font-['Arvo']">
                {restaurant.businessPhone}
              </p>
            </div>

            <Link
              to={`/restaurant/${restaurant.id}`}
              className="w-full mt-2 px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] transition-colors duration-300 flex items-center justify-center font-['Arvo']"
            >
              View Menu
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantRecommendations;
