// src/hooks/useReviews.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reviewApi } from "../api/review.api";

/* =========================================================
 *                 PUBLIC HOOKS (AI CŨNG XEM ĐƯỢC)
 *  - Dùng cho trang chi tiết sản phẩm, không cần login
 * =======================================================*/

/**
 * Lấy danh sách review của 1 sản phẩm (public)
 * Dùng ở ProductDetail.jsx
 *
 * VD:
 *   const { data, isLoading } = useProductReviews({ productId, page: 1, limit: 10 });
 *   const reviews = data?.data || [];
 *   const meta = data?.meta;
 */
export function useProductReviews({ productId, page = 1, limit = 10 }) {
  return useQuery({
    queryKey: ["productReviews", { productId, page, limit }],
    queryFn: () => reviewApi.getProductReviews({ productId, page, limit }),
    enabled: !!productId,
    // Không select để component nhận đúng { success, data, meta }
  });
}

/* =========================================================
 *           CUSTOMER HOOKS (KHÁCH HÀNG ĐÃ LOGIN)
 *  - Chỉ dùng khi user đã đăng nhập và đã mua hàng
 *  - Dùng trong "Đơn hàng của tôi" để viết / sửa review
 * =======================================================*/

/**
 * Lấy review của chính mình cho 1 product trong 1 đơn
 *
 * VD:
 *   const { data: myReview } = useMyReview({ orderId, productId });
 */
export function useMyReview({ orderId, productId }) {
  return useQuery({
    queryKey: ["myReview", { orderId, productId }],
    queryFn: () => reviewApi.getMyReview({ orderId, productId }),
    enabled: !!orderId && !!productId,
    select: (res) => res.data || null, // { success, data } => lấy data
  });
}

/**
 * Tạo / sửa (upsert) review của khách hàng
 *
 * VD:
 *   const upsertReview = useUpsertMyReview();
 *   upsertReview.mutate({
 *     orderId,
 *     productId,
 *     rating,
 *     title,
 *     content,
 *     images,
 *   });
 */
export function useUpsertMyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => reviewApi.upsertMyReview(payload),
    onSuccess: (_response, variables) => {
      // variables chính là payload truyền vào mutate(...)
      const { orderId, productId } = variables || {};

      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");

      // Invalidate lại cache review của chính mình
      if (orderId && productId) {
        queryClient.invalidateQueries({
          queryKey: ["myReview", { orderId, productId }],
        });
      }

      // Invalidate lại danh sách review public của sản phẩm
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["productReviews", { productId }],
        });
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Gửi đánh giá thất bại";
      toast.error(message);
    },
  });
}

/* =========================================================
 *        ADMIN / STAFF HOOKS (TRANG QUẢN TRỊ REVIEW)
 *  - Dùng cho Admin / Staff để trả lời review của khách
 *  - Backend đã chặn role bằng requireRoles(ADMIN, STAFF)
 * =======================================================*/
export function useAdminReviews({
  page = 1,
  limit = 20,
  days = 14,
  rating = "all",
  hasReply = "all",
  q = "",
}) {
  return useQuery({
    queryKey: ["adminReviews", { page, limit, days, rating, hasReply, q }],
    queryFn: () =>
      reviewApi.adminGetReviews({
        page,
        limit,
        days,
        rating,
        hasReply,
        q,
      }),
    keepPreviousData: true,
  });
}
export function useToggleReviewVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId) => reviewApi.toggleVisibility(reviewId),
    onSuccess: (data) => {
      toast.success(data.message);
      // Refresh lại list admin review
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      // Refresh lại list public (nếu đang xem chi tiết sp)
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error("Lỗi khi thay đổi trạng thái đánh giá");
    },
  });
}

/**
 * 🔁 Alias để không phải sửa các component cũ
 * ReviewModal.jsx đang import { useUpsertReview }
 */
export { useUpsertMyReview as useUpsertReview };

/**
 * Admin / Staff: Trả lời hoặc sửa trả lời một review
 */
export function useAdminReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, content }) =>
      reviewApi.adminReplyReview({ reviewId, content }),

    onSuccess: (_response, _variables) => {
      toast.success("Đã gửi phản hồi tới khách hàng");

      // Cập nhật lại list admin review
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });

      // Nếu đang mở product detail thì cũng nên invalidate productReviews
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Phản hồi đánh giá thất bại";
      toast.error(message);
    },
  });
}

export function useAdminReviewStats({ days = 14 } = {}) {
  return useQuery({
    queryKey: ["adminReviewStats", { days }],
    queryFn: () => reviewApi.adminGetReviewStats({ days }),
    // Lấy luôn field data bên trong
    select: (res) => res.data,
    staleTime: 60_000,
  });
}
