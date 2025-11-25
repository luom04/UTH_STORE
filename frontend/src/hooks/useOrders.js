// src/hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/orderApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../routes/paths";

/**
 * Hook tạo đơn hàng mới
 */
export function useCreateOrder() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (response) => {
      // Invalidate cart để refresh
      qc.invalidateQueries({ queryKey: ["cart"] });
      // ✅ refetch ví voucher để loại mã đã dùng
      qc.invalidateQueries({ queryKey: ["myCoupons"] });

      // (optional) nếu bạn có list order của user
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      // Toast thành công
      toast.success(" Đặt hàng thành công 🎉", {
        duration: 3000,
      });

      // Chuyển đến trang success
      setTimeout(() => {
        navigate(PATHS.CHECKOUT_SUCCESS, {
          state: { order: response.data },
        });
      }, 500);
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;

      if (message.includes("Giỏ hàng trống")) {
        toast.error(" Giỏ hàng của bạn đang trống");
      } else if (message.includes("chỉ còn")) {
        toast.error(`⚠️ ${message}`);
      } else if (message.includes("Thông tin giao hàng")) {
        toast.error("📋 Vui lòng điền đầy đủ thông tin giao hàng");
      } else {
        toast.error(message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    },
  });
}

/**
 * Hook lấy danh sách đơn hàng của tôi
 */
export function useMyOrders(params = {}) {
  return useQuery({
    queryKey: ["orders", "my", params],
    queryFn: () => orderApi.getMyOrders(params),
    select: (response) => response.data,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook lấy chi tiết đơn hàng
 */
export function useOrder(orderId) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId,
    select: (response) => response.data,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook hủy đơn hàng
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => orderApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(" Đã hủy đơn hàng");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;
      toast.error(message || "Hủy đơn hàng thất bại");
    },
  });
}

/* =========================================================
 *          ADMIN / STAFF HOOKS
 * =======================================================*/

// ✅ ADMIN: Lấy danh sách đơn hàng (có filter + days)
export function useAdminOrders({
  page = 1,
  limit = 20,
  status = "",
  q = "",
  days = 7, // ✅ default 7 ngày để tránh load hết
}) {
  return useQuery({
    queryKey: ["adminOrders", { page, limit, status, q, days }],
    queryFn: () =>
      orderApi.getAdminOrders({
        page,
        limit,
        status: status || undefined,
        q: q || undefined,
        days, // ✅ truyền days lên BE
      }),

    select: (response) => {
      const list = Array.isArray(response?.data) ? response.data : [];
      const meta = response?.meta || {
        page,
        limit,
        total: list.length,
        totalPages: 1,
      };

      return { data: list, meta };
    },

    keepPreviousData: true,
    staleTime: 30_000,
  });
}

/**
 * Admin: Cập nhật trạng thái đơn hàng bất kỳ
 */
export function useAdminUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, note }) =>
      orderApi.updateOrderStatusAdmin({ orderId, status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success(" Đã cập nhật trạng thái đơn hàng");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;
      toast.error(message || "Cập nhật trạng thái thất bại");
    },
  });
}

/**
 * Admin: Xác nhận đơn (set status = 'confirmed')
 */
export function useAdminConfirmOrder() {
  const mutateStatus = useAdminUpdateOrderStatus();

  return {
    ...mutateStatus,
    confirm: ({ orderId, note = "" }) =>
      mutateStatus.mutate({ orderId, status: "confirmed", note }),
  };
}

/**
 * Admin: Thống kê đơn hàng (chart)
 * range: 7 | 14 | 30 (ngày)
 */
export function useAdminOrderStats(days = 7) {
  return useQuery({
    queryKey: ["adminOrderStats", days],
    queryFn: () => orderApi.getAdminOrderStats({ days }),
    select: (response) => {
      // BE trả về: { success, data: { days, from, to, items } }
      const payload = response?.data || {};
      const items = payload.items || payload.buckets || [];

      // --- [ĐÂY LÀ CHỖ QUAN TRỌNG CẦN SỬA] ---
      // Code cũ của bạn bị thiếu các dòng pending, confirmed, shipping
      // nên ReportsPage nhận được giá trị undefined -> cộng ra 0 -> biểu đồ rỗng.
      const buckets = items.map((i) => ({
        date: i.date, // dạng YYYY-MM-DD
        totalOrders: i.totalOrders || 0,
        revenue: i.revenue || 0,

        // 👇 PHẢI THÊM CÁC DÒNG NÀY VÀO:
        pending: i.pending || 0,
        confirmed: i.confirmed || 0,
        shipping: i.shipping || 0,
        completed: i.completed || 0,
        canceled: i.canceled || 0,
      }));
      // ---------------------------------------

      // Tính summary
      const totalOrders = buckets.reduce(
        (sum, b) => sum + (b.totalOrders || 0),
        0
      );
      const totalRevenue = buckets.reduce(
        (sum, b) => sum + (b.revenue || 0),
        0
      );
      const completedCount = buckets.reduce(
        (sum, b) => sum + (b.completed || 0),
        0
      );

      const completedRate =
        totalOrders > 0 ? (completedCount * 100) / totalOrders : 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        buckets,
        summary: {
          totalOrders,
          totalRevenue,
          completedRate,
          avgOrderValue,
          days: payload.days,
          from: payload.from,
          to: payload.to,
        },
      };
    },
    staleTime: 60_000,
  });
}
