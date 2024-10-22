import React, { useState } from "react";
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

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Margherita Pizza",
      category: "Pizza",
      price: 12.99,
      status: "active",
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      category: "Pizza",
      price: 14.99,
      status: "active",
    },
    {
      id: 3,
      name: "Caesar Salad",
      category: "Salads",
      price: 8.99,
      status: "inactive",
    },
    {
      id: 4,
      name: "Chicken Wings",
      category: "Appetizers",
      price: 10.99,
      status: "active",
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "John Doe",
      items: ["Margherita Pizza", "Caesar Salad"],
      total: 21.98,
      status: "pending",
    },
    {
      id: 2,
      customer: "Jane Smith",
      items: ["Pepperoni Pizza"],
      total: 14.99,
      status: "completed",
    },
    {
      id: 3,
      customer: "Mike Johnson",
      items: ["Chicken Wings", "Pepperoni Pizza"],
      total: 25.98,
      status: "in-progress",
    },
  ]);

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
              <div className="h-8 w-8 rounded-full bg-[#990001] text-white flex items-center justify-center font-['Arvo']">
                RO
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
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
                  $2,456.89
                </p>
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <Users className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  156
                </p>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <UtensilsCrossed className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  8
                </p>
              </div>
            </div>
          </div>

          {/* Growth Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-[#990001] bg-opacity-10 p-3 mr-4">
                <TrendingUp className="w-6 h-6 text-[#990001]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Arvo']">
                  Growth Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 font-['Arvo']">
                  +12.5%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {["overview", "menu", "orders", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-[#990001] text-[#990001]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-['Arvo'] font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#990001] focus:border-[#990001] font-['Arvo']"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <button className="flex items-center px-4 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] font-['Arvo']">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap font-['Arvo']">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-['Arvo']">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-['Arvo']">
                            ${item.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              } font-['Arvo']`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-[#990001] hover:text-[#800001] mr-3">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 font-['Arvo']">
                    Recent Orders
                  </h3>
                  <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-['Arvo']">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Arvo']">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap font-['Arvo']">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-['Arvo']">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 font-['Arvo']">
                            {order.items.join(", ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-['Arvo']">
                            ${order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              } font-['Arvo']`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
