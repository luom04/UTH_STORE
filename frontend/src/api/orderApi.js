// src/api/order.api.js
import axiosInstance from "./axiosInstance";

export const orderApi = {
  /**
   * Tạo đơn hàng mới
   * POST /api/orders
   */
  createOrder: async (orderData) => {
    const { data } = await axiosInstance.post("/orders", orderData);
    return data;
  },

  /**
   * Lấy danh sách đơn hàng của tôi
   * GET /api/orders
   */
  getMyOrders: async (params = {}) => {
    const { data } = await axiosInstance.get("/orders", { params });
    return data;
  },

  /**
   * Lấy chi tiết đơn hàng
   * GET /api/orders/:id
   */
  getOrderById: async (orderId) => {
    const { data } = await axiosInstance.get(`/orders/${orderId}`);
    return data;
  },

  /**
   * Hủy đơn hàng
   * PUT /api/orders/:id/cancel
   */
  cancelOrder: async (orderId, reason = "") => {
    const { data } = await axiosInstance.put(`/orders/${orderId}/cancel`, {
      reason,
    });
    return data;
  },

  // ================================
  // ADMIN / STAFF
  // ================================

  /**
   * Admin: Lấy tất cả đơn hàng
   * GET /api/orders/admin/all
   */
  getAdminOrders: async ({
    page = 1,
    limit = 20,
    status = "",
    q = "",
    days, // ✅ THÊM
  } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (q) params.search = q;
    if (days) params.days = days; // ✅ Gửi days lên BE

    const { data } = await axiosInstance.get("/orders/admin/all", { params });
    return data;
  },

  /**
   * Admin: Cập nhật trạng thái đơn hàng
   * PUT /api/orders/admin/:id/status
   */
  updateOrderStatusAdmin: async ({ orderId, status, note = "" }) => {
    const { data } = await axiosInstance.put(
      `/orders/admin/${orderId}/status`,
      { status, note }
    );
    return data;
  },

  getAdminOrderStats: async ({ range = 7 } = {}) => {
    const params = { range };
    const { data } = await axiosInstance.get("/orders/admin/stats", { params });
    // data = { success, data: { buckets, summary } }
    return data;
  },
};
