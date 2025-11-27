// src/api/axiosInstance.js - FINAL FIX
import axios from "axios";
import { PATHS } from "../routes/paths";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ✅ Track refreshing để tránh multiple calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(axiosInstance(prom.config));
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

    // ✅ Các route KHÔNG auto-retry
    const noRetryRoutes = [
      "/auth/refresh",
      "/auth/login",
      "/auth/register",
      "/auth/logout", // ✅ QUAN TRỌNG: Thêm logout
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

    // ✅ Reject ngay với no-retry routes
    if (isNoRetryRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    // ✅ Xử lý 401
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        console.error("⛔ Refresh token failed");

        // ✅ Clear data
        localStorage.removeItem("user");
        sessionStorage.clear();

        // ✅ Chỉ redirect nếu:
        // 1. Không phải đang ở trang public
        // 2. Refresh thất bại do token hết hạn (không phải network error)
        const currentPath = window.location.pathname;
        const publicPaths = [
          PATHS.LOGIN,
          PATHS.REGISTER,
          PATHS.HOME,
          "/products", // ✅ Thêm các trang public khác
          "/about",
        ];

        const isPublicPath = publicPaths.some((path) =>
          currentPath.includes(path)
        );

        const isAuthError =
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403;

        if (!isPublicPath && isAuthError) {
          window.location.href = `${PATHS.LOGIN}?redirect=${encodeURIComponent(
            currentPath
          )}`;
        }

        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn"));
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ Xử lý lỗi khác
    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra từ server";

      // Tạo Error object nhưng vẫn giữ lại status code để component sử dụng nếu cần
      const customError = new Error(message);
      customError.status = error.response.status;
      customError.code = error.response.data?.code; // Nếu BE có trả về error code

      return Promise.reject(customError);
    }

    if (error.request) {
      return Promise.reject(
        new Error("Không thể kết nối đến server. Vui lòng kiểm tra mạng.")
      );
    }

    return Promise.reject(
      new Error(error.message || "Có lỗi không xác định xảy ra")
    );
  }
);

export default axiosInstance;
