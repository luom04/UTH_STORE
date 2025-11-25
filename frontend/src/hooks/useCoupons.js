// src / hooks / useCoupons.js;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "../api/coupon.api";
import toast from "react-hot-toast";

export function useCheckCoupon() {
  return useMutation({
    mutationFn: couponApi.check,
    onError: (err) => {
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ");
    },
    onSuccess: (data) => {
      if (!data?.discountAmount && data?.discountAmount !== 0) return; // ✅ guard nhẹ
      toast.success(
        `Áp dụng mã thành công! Giảm ${data.discountAmount.toLocaleString()}đ`
      );
    },
  });
}

// Admin Hook
export function useAdminCoupons() {
  return useQuery({
    queryKey: ["adminCoupons"],
    queryFn: couponApi.getAll,
  });
}

export function useCouponActions() {
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: couponApi.create,
    onSuccess: () => {
      toast.success("Tạo mã giảm giá thành công! 🎉");
      qc.invalidateQueries({ queryKey: ["adminCoupons"] });
      qc.invalidateQueries({ queryKey: ["myCoupons"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi tạo mã"),
  });

  const deleteMut = useMutation({
    mutationFn: couponApi.delete,
    onSuccess: () => {
      toast.success("Đã xóa mã");
      qc.invalidateQueries({ queryKey: ["adminCoupons"] });
      qc.invalidateQueries({ queryKey: ["myCoupons"] });
    },
  });

  return { createMut, deleteMut };
}

// User Hook
export function useMyCoupons() {
  return useQuery({
    queryKey: ["myCoupons"],
    queryFn: couponApi.getAvailable,
    staleTime: 5 * 60 * 1000,
  });
}
