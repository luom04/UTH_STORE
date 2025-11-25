//backend/src/controllers/coupon.controller.js
import { CouponService } from "../services/coupon.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// API check mã (Dùng ở trang Checkout)
export const checkCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const userId = req.user._id;

  // Gọi service tính toán (không lưu DB)
  const result = await CouponService.applyCoupon(userId, code, orderTotal);

  res.json({ success: true, data: result });
});

// Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponService.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

export const getAdminCoupons = asyncHandler(async (req, res) => {
  const coupons = await CouponService.getAdminCoupons();
  res.json({ success: true, data: coupons });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await CouponService.delete(req.params.id);
  res.json({ success: true, message: "Đã xóa mã giảm giá" });
});

// User
export const getMyCoupons = asyncHandler(async (req, res) => {
  // req.user._id lấy từ token
  const coupons = await CouponService.getAvailableCoupons(req.user._id);
  res.json({ success: true, data: coupons });
});
