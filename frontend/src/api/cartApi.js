// src/api/cart.api.js
import axiosInstance from "./axiosInstance";

export const cartApi = {
  /**
   * Lấy giỏ hàng của user đang đăng nhập
   * GET /api/cart
   */
  getCart: async () => {
    const { data } = await axiosInstance.get("/cart");
    return data;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * POST /api/cart/items
   */
  addItem: async (productId, qty = 1, options = {}) => {
    const { data } = await axiosInstance.post("/cart/items", {
      productId,
      qty,
      options,
    });
    return data;
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   * PUT /api/cart/items/:itemId
   */
  updateItem: async (itemId, qty) => {
    const { data } = await axiosInstance.put(`/cart/items/${itemId}`, {
      qty,
    });
    return data;
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * DELETE /api/cart/items/:itemId
   */
  removeItem: async (itemId) => {
    const { data } = await axiosInstance.delete(`/cart/items/${itemId}`);
    return data;
  },

  /**
   * Xóa toàn bộ giỏ hàng
   * DELETE /api/cart/clear
   */
  clearCart: async () => {
    const { data } = await axiosInstance.delete("/cart/clear");
    return data;
  },
};
