// src/api/report.api.js
import axiosInstance from "./axiosInstance";

export const reportApi = {
  // API lấy số liệu tồn kho (giữ nguyên)
  getInventoryReport: async () => {
    const { data } = await axiosInstance.get("/reports/inventory");
    return data;
  },

  // --- THÊM HÀM NÀY ---
  // Hàm này chỉ lo việc gọi axios và trả về cục data (blob)
  downloadExport: async (url) => {
    const response = await axiosInstance.get(url, {
      responseType: "blob", // Quan trọng để nhận file
    });
    return response.data;
  },
};
