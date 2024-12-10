import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  UtensilsCrossed,
  Settings,
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Category options for menu items
const CATEGORIES = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Specials",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
];

// Dietary restrictions options
const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Kosher",
];

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("menu");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
  });

  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    preparationTime: "",
    isSpicy: false,
    dietaryRestrictions: [],
    allergens: [],
    status: "active",
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    // Load menu items from localStorage
    const savedMenuItems = localStorage.getItem(`menuItems_${user?.uid}`);
    const savedOrders = localStorage.getItem(`orders_${user?.uid}`);

    if (savedMenuItems) {
      setMenuItems(JSON.parse(savedMenuItems));
    }
    if (savedOrders) {
      const orderData = JSON.parse(savedOrders);
      setOrders(orderData);
      calculateStats(orderData);
    }
    setLoading(false);
  }, [user?.uid]);

  const calculateStats = (orderData) => {
    const total = orderData.reduce((sum, order) => sum + (order.total || 0), 0);
    const itemSales = {};

    orderData.forEach((order) => {
      order.items?.forEach((item) => {
        itemSales[item.id] = (itemSales[item.id] || 0) + item.quantity;
      });
    });

    const topItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, quantity]) => {
        const menuItem = menuItems.find((item) => item.id === id);
        return {
          id,
          name: menuItem?.name || "Unknown Item",
          quantity,
          revenue: (menuItem?.price || 0) * quantity,
        };
      });

    setStats({
      totalRevenue: total,
      totalOrders: orderData.length,
      averageOrderValue: orderData.length ? total / orderData.length : 0,
      topSellingItems: topItems,
    });
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const menuItemData = {
        ...menuItemForm,
        id: editingItem?.id || Date.now().toString(),
        price: parseFloat(menuItemForm.price),
        preparationTime: parseInt(menuItemForm.preparationTime),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedMenuItems;
      if (editingItem) {
        updatedMenuItems = menuItems.map((item) =>
          item.id === editingItem.id ? menuItemData : item,
        );
      } else {
        updatedMenuItems = [...menuItems, menuItemData];
      }

      setMenuItems(updatedMenuItems);
      localStorage.setItem(
        `menuItems_${user?.uid}`,
        JSON.stringify(updatedMenuItems),
      );

      setShowAddModal(false);
      setEditingItem(null);
      resetMenuItemForm();
    } catch (error) {
      console.error("Error adding/updating menu item:", error);
      alert("Failed to save menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const updatedMenuItems = menuItems.filter((item) => item.id !== itemId);
      setMenuItems(updatedMenuItems);
      localStorage.setItem(
        `menuItems_${user?.uid}`,
        JSON.stringify(updatedMenuItems),
      );
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item. Please try again.");
    }
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setMenuItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      isSpicy: item.isSpicy,
      dietaryRestrictions: item.dietaryRestrictions || [],
      allergens: item.allergens || [],
      status: item.status,
    });
    setShowAddModal(true);
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: "",
      description: "",
      price: "",
      category: "",
      preparationTime: "",
      isSpicy: false,
      dietaryRestrictions: [],
      allergens: [],
      status: "active",
    });
  };

  const handleUpdateStatus = (itemId, newStatus) => {
    try {
      const updatedMenuItems = menuItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

      setMenuItems(updatedMenuItems);
      localStorage.setItem(
        `menuItems_${user?.uid}`,
        JSON.stringify(updatedMenuItems),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update item status. Please try again.");
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
      {/* Single Dashboard Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <span className="text-2xl font-bold text-[#990001] font-['Arvo']">
                DineWise
              </span>
              <span className="text-gray-500 font-['Arvo']">
                Restaurant Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 font-['Arvo']">
                  {user?.businessName}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <BarChart3 className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <Users className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <UtensilsCrossed className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Menu Items
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  {menuItems.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <DollarSign className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Avg. Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  ${stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Management Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-['Arvo']">
                Menu Management
              </h2>
              <button
                onClick={() => {
                  resetMenuItemForm();
                  setEditingItem(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] font-['Arvo'] flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#990001] focus:border-[#990001]"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-[#990001] focus:border-[#990001]"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Menu Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMenuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditMenuItem(item)}
                        className="text-[#990001] hover:text-[#800001] mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            item.id,
                            item.status === "active" ? "inactive" : "active",
                          )
                        }
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {item.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 font-['Arvo']">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={menuItemForm.name}
                    onChange={(e) =>
                      setMenuItemForm({ ...menuItemForm, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Description
                  </label>
                  <textarea
                    required
                    value={menuItemForm.description}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                      Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={menuItemForm.price}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            price: e.target.value,
                          })
                        }
                        className="mt-1 block w-full pl-7 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                      Category
                    </label>
                    <select
                      required
                      value={menuItemForm.category}
                      onChange={(e) =>
                        setMenuItemForm({
                          ...menuItemForm,
                          category: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={menuItemForm.preparationTime}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        preparationTime: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#990001] focus:border-[#990001]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Arvo']">
                    Dietary Restrictions
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {DIETARY_RESTRICTIONS.map((restriction) => (
                      <label
                        key={restriction}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={menuItemForm.dietaryRestrictions.includes(
                            restriction,
                          )}
                          onChange={(e) => {
                            const updatedRestrictions = e.target.checked
                              ? [
                                  ...menuItemForm.dietaryRestrictions,
                                  restriction,
                                ]
                              : menuItemForm.dietaryRestrictions.filter(
                                  (r) => r !== restriction,
                                );
                            setMenuItemForm({
                              ...menuItemForm,
                              dietaryRestrictions: updatedRestrictions,
                            });
                          }}
                          className="form-checkbox h-4 w-4 text-[#990001] rounded border-gray-300 focus:ring-[#990001]"
                        />
                        <span className="ml-2 text-sm text-gray-700 font-['Arvo']">
                          {restriction}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      resetMenuItemForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] font-['Arvo']"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#990001] border border-transparent rounded-md hover:bg-[#800001] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990001] disabled:opacity-50 disabled:cursor-not-allowed font-['Arvo']"
                  >
                    {loading ? "Saving..." : "Save Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
