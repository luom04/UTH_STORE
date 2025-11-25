// src/api/dashboard.api.js
import axiosInstance from "./axiosInstance";

export const dashboardApi = {
  // Gọi API lấy thống kê
  getStats: async () => {
    const { data } = await axiosInstance.get("/dashboard");
    // Backend trả về: { success: true, data: { ...stats } }
    return data;
  },
};
