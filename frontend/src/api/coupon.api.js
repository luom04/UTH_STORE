// src / api / coupon.api.js;
import axiosInstance from "./axiosInstance";

export const couponApi = {
  check: async ({ code, orderTotal }) => {
    const { data } = await axiosInstance.post("/coupons/check", {
      code,
      orderTotal,
    });
    return data.data; // { discountAmount, newTotal, ... }
  },

  // Admin
  getAll: async () => {
    const { data } = await axiosInstance.get("/coupons/admin");
    return data.data;
  },
  create: async (payload) => axiosInstance.post("/coupons", payload),
  delete: async (id) => axiosInstance.delete(`/coupons/${id}`),

  // User
  getAvailable: async () => {
    const { data } = await axiosInstance.get("/coupons/available");
    return data.data;
  },
};
