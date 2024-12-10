import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Sample restaurant data
// Sample restaurant data
const SAMPLE_RESTAURANTS = [
  {
    id: "1",
    businessName: "Spice Garden",
    cuisine: "Indian",
    rating: 4.5,
    businessAddress: "123 Curry Lane, Foodville",
    businessPhone: "(555) 123-4567",
    menuItems: [
      {
        id: "1",
        name: "Butter Chicken",
        price: 15.99,
        description: "Creamy tomato-based curry with tender chicken",
        category: "Main Course",
        isSpicy: true,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "2",
        name: "Palak Paneer",
        price: 13.99,
        description: "Spinach curry with cottage cheese",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
      {
        id: "3",
        name: "Vegetable Samosas",
        price: 6.99,
        description: "Crispy pastries filled with spiced potatoes and peas",
        category: "Appetizers",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "4",
        name: "Chicken Biryani",
        price: 17.99,
        description: "Fragrant rice dish with spiced chicken and aromatics",
        category: "Main Course",
        isSpicy: true,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "5",
        name: "Dal Makhani",
        price: 12.99,
        description: "Creamy black lentils simmered overnight",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
      {
        id: "6",
        name: "Chicken Tikka",
        price: 14.99,
        description: "Tandoor-grilled marinated chicken pieces",
        category: "Appetizers",
        isSpicy: true,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "7",
        name: "Malai Kofta",
        price: 13.99,
        description: "Cheese and vegetable dumplings in rich cream sauce",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "8",
        name: "Lamb Rogan Josh",
        price: 18.99,
        description: "Kashmiri-style lamb curry with aromatic spices",
        category: "Main Course",
        isSpicy: true,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "9",
        name: "Gulab Jamun",
        price: 5.99,
        description: "Sweet milk dumplings in rose-scented syrup",
        category: "Desserts",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "10",
        name: "Mango Lassi",
        price: 4.99,
        description: "Yogurt-based mango smoothie",
        category: "Beverages",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
    ],
  },
  {
    id: "2",
    businessName: "Pasta Paradise",
    cuisine: "Italian",
    rating: 4.3,
    businessAddress: "456 Pizza Street, Foodville",
    businessPhone: "(555) 234-5678",
    menuItems: [
      {
        id: "1",
        name: "Margherita Pizza",
        price: 14.99,
        description: "Fresh tomatoes, mozzarella, and basil",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "2",
        name: "Spaghetti Carbonara",
        price: 16.99,
        description: "Classic pasta with eggs, cheese, and pancetta",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: [],
      },
      {
        id: "3",
        name: "Bruschetta",
        price: 8.99,
        description: "Toasted bread with tomatoes, garlic, and basil",
        category: "Appetizers",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "4",
        name: "Fettuccine Alfredo",
        price: 15.99,
        description: "Pasta in creamy parmesan sauce",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "5",
        name: "Lasagna",
        price: 17.99,
        description: "Layered pasta with meat sauce and cheese",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: [],
      },
      {
        id: "6",
        name: "Caprese Salad",
        price: 10.99,
        description: "Fresh mozzarella, tomatoes, and basil",
        category: "Appetizers",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
      {
        id: "7",
        name: "Tiramisu",
        price: 7.99,
        description: "Classic coffee-flavored Italian dessert",
        category: "Desserts",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "8",
        name: "Penne Arrabbiata",
        price: 14.99,
        description: "Spicy tomato sauce with garlic and red chilies",
        category: "Main Course",
        isSpicy: true,
        dietaryRestrictions: ["Vegetarian"],
      },
      {
        id: "9",
        name: "Chicken Marsala",
        price: 18.99,
        description: "Chicken cutlets in Marsala wine sauce",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: [],
      },
      {
        id: "10",
        name: "Cannoli",
        price: 6.99,
        description: "Crispy pastry tubes with sweet ricotta filling",
        category: "Desserts",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian"],
      },
    ],
  },
  {
    id: "3",
    businessName: "Sushi Station",
    cuisine: "Japanese",
    rating: 4.7,
    businessAddress: "789 Wasabi Way, Foodville",
    businessPhone: "(555) 345-6789",
    menuItems: [
      {
        id: "1",
        name: "California Roll",
        price: 12.99,
        description: "Crab, avocado, and cucumber",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "2",
        name: "Spicy Tuna Roll",
        price: 14.99,
        description: "Fresh tuna with spicy sauce",
        category: "Main Course",
        isSpicy: true,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "3",
        name: "Miso Soup",
        price: 4.99,
        description: "Traditional Japanese soup with tofu",
        category: "Appetizers",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
      {
        id: "4",
        name: "Chicken Teriyaki",
        price: 16.99,
        description: "Grilled chicken with teriyaki sauce",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: [],
      },
      {
        id: "5",
        name: "Tempura Udon",
        price: 15.99,
        description: "Noodle soup with crispy tempura",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: [],
      },
      {
        id: "6",
        name: "Dragon Roll",
        price: 16.99,
        description: "Eel and cucumber topped with avocado",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "7",
        name: "Edamame",
        price: 5.99,
        description: "Steamed soybeans with sea salt",
        category: "Appetizers",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
      {
        id: "8",
        name: "Salmon Nigiri",
        price: 6.99,
        description: "Fresh salmon over pressed rice",
        category: "Main Course",
        isSpicy: false,
        dietaryRestrictions: ["Gluten-Free"],
      },
      {
        id: "9",
        name: "Green Tea Ice Cream",
        price: 4.99,
        description: "Traditional Japanese ice cream",
        category: "Desserts",
        isSpicy: false,
        dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      },
      {
        id: "10",
        name: "Volcano Roll",
        price: 15.99,
        description: "Spicy baked scallops over California roll",
        category: "Main Course",
        isSpicy: true,
        dietaryRestrictions: ["Gluten-Free"],
      },
    ],
  },
];

const categories = [
  "all",
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Japanese",
  "American",
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handlePreferencesUpdate = () => {
    navigate("/preferences", { state: { fromDashboard: true } });
  };

  const filteredRestaurants = SAMPLE_RESTAURANTS.filter((restaurant) => {
    const matchesSearch =
      restaurant.businessName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurant.businessAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      restaurant.cuisine.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 font-['Arvo']">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
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
            <button
              onClick={handlePreferencesUpdate}
              className="flex items-center px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] font-['Arvo']"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Update Preferences
            </button>
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

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="font-['Arvo']">
                    {restaurant.businessPhone}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(`/restaurant/${restaurant.id}`, {
                      state: { restaurant },
                    })
                  }
                  className="w-full mt-2 px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] transition-colors duration-300 font-['Arvo'] flex items-center justify-center"
                >
                  View Menu
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
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
