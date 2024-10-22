import axios from "./axios";

export const restaurantService = {
  async getRestaurants(filters = {}) {
    const response = await axios.get("/restaurants", { params: filters });
    return response.data;
  },

  async getRestaurantById(id) {
    const response = await axios.get(`/restaurants/${id}`);
    return response.data;
  },

  async updateMenu(restaurantId, menuData) {
    const response = await axios.put(
      `/restaurants/${restaurantId}/menu`,
      menuData,
    );
    return response.data;
  },

  async getOrders(restaurantId, status) {
    const response = await axios.get(`/restaurants/${restaurantId}/orders`, {
      params: { status },
    });
    return response.data;
  },
};
