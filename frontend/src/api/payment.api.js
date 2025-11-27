//src/api/payment.api.js
import axiosInstance from "./axiosInstance";

export const paymentApi = {
  // Tạo thanh toán VNPay
  createVNPayPayment: async (paymentData) => {
    const response = await axiosInstance.post(
      "/payment/vnpay/create",
      paymentData
    );
    return response.data;
  },

  // ✅ Tạo thanh toán MoMo
  createMoMoPayment: async (paymentData) => {
    const response = await axiosInstance.post(
      "/payment/momo/create",
      paymentData
    );
    return response.data;
  },

  // Xác thực kết quả thanh toán (optional - nếu cần)
  // verifyPayment: async (orderId) => {
  //   const response = await axiosInstance.get(`/payment/verify/${orderId}`);
  //   return response.data;
  // },
};
