// src/api/authApi.js
import axiosInstance from "./axiosInstance";
export const authApi = {
  register: async (userData) => {
    const { data } = await axiosInstance.post("/auth/register", {
      name: userData.fullName,
      email: userData.email,
      password: userData.password,
    });
    return data;
  },

  // src/api/authApi.js
  // ✅ ADD THIS
  verifyEmail: async (token) => {
    const { data } = await axiosInstance.post("/auth/verify-email", {
      token,
    });
    return data;
  },

  resendVerification: async ({ email }) => {
    // API của bạn là /auth/resend-verification và cần { email }
    const { data } = await axiosInstance.post("/auth/resend-verification", {
      email,
    });
    return data;
  },
  login: async ({ email, password }) => {
    const { data } = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return data;
  },

  logout: async () => {
    const { data } = await axiosInstance.post("/auth/logout");
    return data;
  },

  me: async () => {
    const { data } = await axiosInstance.get("/auth/me");
    return data?.data ?? data;
  },

  updateMe: async (payload) => {
    const { data } = await axiosInstance.put("/auth/me", payload);
    return data?.data ?? data;
  },

  forgotPassword: async (email) => {
    const { data } = await axiosInstance.post("/auth/request-password-reset", {
      email,
    });
    return data;
  },

  resetPassword: async ({ token, newPassword }) => {
    const { data } = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },

  refresh: async () => {
    const { data } = await axiosInstance.post("/auth/refresh");
    return data;
  },

  // [CUSTOMER] Gửi yêu cầu
  requestStudentVerify: async (payload) => {
    // payload: { studentIdImage, schoolName }
    const { data } = await axiosInstance.post("/auth/student-request", payload);
    return data;
  },

  // [ADMIN] Lấy danh sách chờ
  getPendingRequests: async () => {
    const { data } = await axiosInstance.get("/auth/admin/student-requests");
    return data;
  },

  // [ADMIN] Duyệt / Từ chối
  verifyRequest: async ({ userId, status, reason }) => {
    const { data } = await axiosInstance.put(
      `/auth/admin/verify-student/${userId}`,
      {
        status,
        reason,
      }
    );
    return data;
  },
};
