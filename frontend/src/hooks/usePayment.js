// src/hooks/usePayment.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "../api/payment.api";
import { toast } from "react-hot-toast";

// Hook tạo thanh toán VNPay
export const useCreateVNPayPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentApi.createVNPayPayment,
    onSuccess: (data) => {
      console.log("VNPay payment created:", data);
      // 🔥 QUAN TRỌNG: Làm mới cache giỏ hàng ngay lập tức (về 0)
      // Để tránh việc UI vẫn hiển thị còn hàng dù Backend đã xóa
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Lỗi tạo thanh toán VNPay";
      toast.error(message);
    },
  });
};

// Hook tạo thanh toán MoMo
export const useCreateMoMoPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentApi.createMoMoPayment,
    onSuccess: (data) => {
      console.log("MoMo payment created:", data);
      // 🔥 QUAN TRỌNG: Làm mới cache giỏ hàng ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Lỗi tạo thanh toán MoMo";
      toast.error(message);
    },
  });
};

// ✅ Hook retry thanh toán VNPay cho order unpaid
export const useRetryVNPayPayment = () => {
  return useMutation({
    mutationFn: (orderId) => paymentApi.retryVNPayPayment(orderId),
    onSuccess: (data) => {
      if (data?.paymentUrl) {
        // redirect sang VNPay
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Không lấy được link thanh toán VNPay");
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        "Không thể tạo lại phiên thanh toán VNPay";
      toast.error(message);
    },
  });
};
