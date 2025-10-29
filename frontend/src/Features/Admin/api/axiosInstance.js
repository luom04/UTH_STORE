// src/Features/Admin/api/axiosInstance.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

// Tạo axios instance dùng chung cho toàn bộ app
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 giây
});

// Request interceptor (nếu cần thêm token vào header)
axiosInstance.interceptors.request.use(
  (config) => {
    // Có thể thêm logic ở đây (VD: thêm loading state)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý error tập trung
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý 401 - Unauthorized (auto refresh token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token endpoint
        await axiosInstance.post("/auth/refresh");
        // Retry request ban đầu
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại -> redirect login hoặc clear user
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các loại lỗi khác
    if (error.response) {
      // Lỗi từ server (có response)
      const message = error.response.data?.message || "Có lỗi xảy ra từ server";
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      // Lỗi network (không nhận được response)
      return Promise.reject(new Error("Không thể kết nối đến server"));
    }

    // Lỗi khác
    return Promise.reject(new Error(error.message || "Có lỗi xảy ra"));
  }
);

export default axiosInstance;
