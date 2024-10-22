import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  UtensilsCrossed,
  TrendingUp,
  Settings,
  Bell,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const RestaurantDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Listen to menu items
    const menuUnsubscribe = onSnapshot(
      query(
        collection(db, "restaurants", user.uid, "menuItems"),
        orderBy("createdAt", "desc"),
      ),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuItems(items);
        setLoading(false);
      },
    );

    // Listen to orders
    const ordersUnsubscribe = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const orderData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderData);
      },
    );

    return () => {
      menuUnsubscribe();
      ordersUnsubscribe();
    };
  }, [user?.uid]);

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "restaurants", user.uid, "menuItems", itemId));
      } catch (err) {
        console.error("Error deleting menu item:", err);
      }
    }
  };

  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      await updateDoc(doc(db, "restaurants", user.uid, "menuItems", itemId), {
        status: newStatus,
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F0E4] flex items-center justify-center">
        Loading...
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
              <button
                onClick={logout}
                className="h-8 w-8 rounded-full bg-[#990001] text-white flex items-center justify-center font-['Arvo']"
              >
                {user?.businessName?.[0] || "R"}
              </button>
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
                  $
                  {orders
                    .reduce((sum, order) => sum + (order.total || 0), 0)
                    .toFixed(2)}
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
                <p className="text-sm text-gray-600 font-['Arvo']">Customers</p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  {new Set(orders.map((order) => order.customerId)).size}
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
                <TrendingUp className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  {orders.filter((order) => order.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu and Orders Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <nav className="flex space-x-8 px-6 border-b">
            {["menu", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-[#990001] text-[#990001]"
                    : "border-transparent text-gray-500"
                } border-b-2 py-4 px-1 font-['Arvo'] font-medium capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="p-6">
            {activeTab === "menu" ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 rounded-full text-xs ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              item.id,
                              item.status === "active" ? "inactive" : "active",
                            )
                          }
                          className="text-[#990001] hover:text-[#800001] mr-3"
                        >
                          <Edit className="w-4 h-4" />
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
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 rounded-full text-xs ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
