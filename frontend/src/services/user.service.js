import axios from "./axios";

export const userService = {
  async getRecommendations() {
    const response = await axios.get("/users/recommendations");
    return response.data;
  },

  async getOrderHistory() {
    const response = await axios.get("/users/orders");
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await axios.put("/users/profile", profileData);
    return response.data;
  },
};
