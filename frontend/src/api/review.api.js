// src/api/review.api.js
import axiosInstance from "./axiosInstance";

/**
 * Tất cả API liên quan đến review / đánh giá sản phẩm
 */
export const reviewApi = {
  /**
   * PUBLIC: Lấy danh sách review theo product
   * GET /api/reviews/product/:productId?page=&limit=
   */
  getProductReviews: async ({ productId, page = 1, limit = 10 }) => {
    const { data } = await axiosInstance.get(`/reviews/product/${productId}`, {
      params: { page, limit },
    });
    // BE trả: { success, data, meta }
    return data;
  },

  /**
   * CUSTOMER: Lấy review của chính mình cho 1 product trong 1 order
   * GET /api/reviews/my?orderId=&productId=
   */
  getMyReview: async ({ orderId, productId }) => {
    const { data } = await axiosInstance.get("/reviews/my", {
      params: { orderId, productId },
    });
    // { success, data }
    return data;
  },

  /**
   * CUSTOMER: Tạo / sửa (upsert) review
   * POST /api/reviews
   * body: { orderId, productId, rating, title, content, images }
   */
  upsertMyReview: async ({
    orderId,
    productId,
    rating,
    title,
    content,
    images,
  }) => {
    const { data } = await axiosInstance.post("/reviews", {
      orderId,
      productId,
      rating,
      title,
      content,
      images,
    });
    // { success, data }
    return data;
  },

  /**
   * ADMIN / STAFF: Trả lời hoặc sửa trả lời 1 review
   * PUT /api/reviews/admin/:id/reply
   */
  adminReplyReview: async ({ reviewId, content }) => {
    const { data } = await axiosInstance.put(
      `/reviews/admin/${reviewId}/reply`,
      { content }
    );
    // { success, data }
    return data;
  },

  toggleVisibility: async (reviewId) => {
    const { data } = await axiosInstance.patch(
      `/reviews/admin/${reviewId}/visibility`
    );
    return data;
  },

  /**
   * ADMIN / STAFF: Lấy danh sách review mới nhất (dashboard review)
   * GET /api/reviews/admin
   */
  adminGetReviews: async ({
    page = 1,
    limit = 20,
    days = 14,
    rating,
    hasReply,
    q,
  } = {}) => {
    const params = { page, limit, days };

    if (typeof rating !== "undefined" && rating !== "all") {
      params.rating = rating;
    }

    if (hasReply && hasReply !== "all") {
      params.hasReply = hasReply; // "replied" | "unreplied"
    }

    if (q && q.trim()) {
      params.q = q.trim();
    }

    const { data } = await axiosInstance.get("/reviews/admin", { params });
    return data; // { success, data, meta }
  },

  /**
   * ADMIN / STAFF: Thống kê review (cho dashboard)
   * GET /api/reviews/admin/stats?days=7|14|30
   */
  adminGetReviewStats: async ({ days = 14 } = {}) => {
    const params = {};
    if (days) params.days = days;

    const { data } = await axiosInstance.get("/reviews/admin/stats", {
      params,
    });
    // { success, data }
    return data;
  },
};
