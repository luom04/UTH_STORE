// src/api/axiosInstance.js - FINAL FIX
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ✅ Track refreshing để tránh multiple calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Danh sách routes KHÔNG auto-refresh
    const noRetryRoutes = [
      "/auth/refresh",
      "/auth/login",
      "/auth/register",
      "/auth/verify-email",
      "/auth/resend-verification",
      "/auth/request-password-reset",
      "/auth/reset-password",
      "/auth/google",
      "/auth/me",
    ];

    const isNoRetryRoute = noRetryRoutes.some((route) =>
      originalRequest.url?.includes(route)
    );

    // ✅ Nếu là no-retry route hoặc đã retry → reject ngay
    if (isNoRetryRoute || originalRequest._retry) {
      if (error.response) {
        const message =
          error.response.data?.message || "Có lỗi xảy ra từ server";
        return Promise.reject(new Error(message));
      }
      if (error.request) {
        return Promise.reject(new Error("Không thể kết nối đến server"));
      }
      return Promise.reject(new Error(error.message || "Có lỗi xảy ra"));
    }

    // ✅ Xử lý 401 - Auto refresh
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // Đang refresh → add vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh
        await axiosInstance.post("/auth/refresh");

        isRefreshing = false;
        processQueue(null);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // ✅ QUAN TRỌNG: Clear cookies và redirect
        console.error("⛔ Refresh token failed - redirecting to login");

        // Clear local state (nếu có)
        localStorage.clear();

        // Redirect to login (chỉ 1 lần)
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(
          new Error("Session expired. Please login again.")
        );
      }
    }

    // ✅ Xử lý lỗi khác
    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra từ server";
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error("Không thể kết nối đến server"));
    }

    return Promise.reject(new Error(error.message || "Có lỗi xảy ra"));
  }
);

export default axiosInstance;
