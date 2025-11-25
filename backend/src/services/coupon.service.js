// backend/src/services/coupon.service.js
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";

const RANK_HIERARCHY = ["MEMBER", "SILVER", "GOLD", "DIAMOND"];
const RANK_POWER = {
  MEMBER: 0,
  SILVER: 1,
  GOLD: 2,
  DIAMOND: 3,
};

// Hàm helper (để ngoài object để dễ gọi)
async function _getUserRank(userId) {
  const stats = await Order.aggregate([
    { $match: { user: userId, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$grandTotal" } } },
  ]);
  const totalSpent = stats[0]?.total || 0;

  if (totalSpent >= 100000000) return "DIAMOND";
  if (totalSpent >= 50000000) return "GOLD";
  if (totalSpent >= 10000000) return "SILVER";
  return "MEMBER";
}

export const CouponService = {
  // Logic kiểm tra và tính tiền giảm
  async applyCoupon(userId, code, orderTotal) {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon)
      throw new ApiError(httpStatus.NOT_FOUND, "Mã giảm giá không tồn tại");

    // 1. Check thời hạn
    const now = new Date();
    if (coupon.startDate > now)
      throw new ApiError(httpStatus.BAD_REQUEST, "Mã chưa đến đợt áp dụng");
    if (coupon.endDate && coupon.endDate < now)
      throw new ApiError(httpStatus.BAD_REQUEST, "Mã đã hết hạn");

    // 2. Check số lượng
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Mã đã hết lượt sử dụng");
    }

    // Check số lần dùng của user này
    const userUsedCount = coupon.usedBy.filter(
      (id) => id.toString() === userId.toString()
    ).length;

    if (userUsedCount >= coupon.maxUsagePerUser) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Bạn đã hết lượt sử dụng mã này"
      );
    }

    // 3. Check giá trị đơn hàng tối thiểu
    if (orderTotal < coupon.minOrderValue) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Đơn hàng phải từ ${coupon.minOrderValue.toLocaleString()}đ mới được dùng mã này`
      );
    }

    // 4. Check Rank người dùng (Tính năng VIP)
    const userRank = await _getUserRank(userId); // ✅ Gọi hàm helper trực tiếp

    // So sánh power của rank user và rank yêu cầu
    if (RANK_POWER[userRank] < RANK_POWER[coupon.requiredRank]) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Mã này chỉ dành cho hạng ${coupon.requiredRank}. Hạng hiện tại của bạn là ${userRank}`
      );
    }

    // 5. Tính tiền giảm
    let discount = 0;
    if (coupon.discountType === "amount") {
      discount = coupon.value;
    } else {
      // percent
      discount = (orderTotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount > 0) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    }

    return {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount: discount,
      newTotal: Math.max(0, orderTotal - discount),
    };
  },

  // --- USER: Lấy mã phù hợp với Rank ---
  async getAvailableCoupons(userId) {
    // 1. Tính Rank hiện tại của User
    const userRank = await _getUserRank(userId); // ✅ Gọi hàm helper trực tiếp

    // 2. Xác định các Rank được phép thấy
    // VD: User là GOLD (Index 2) -> thấy được [MEMBER, SILVER, GOLD]
    const userRankIndex = RANK_HIERARCHY.indexOf(userRank);
    const eligibleRanks = RANK_HIERARCHY.slice(0, userRankIndex + 1);

    // 3. Query DB lấy tất cả coupon tiềm năng
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      requiredRank: { $in: eligibleRanks }, // Rank phù hợp
      startDate: { $lte: now }, // Đã bắt đầu
      $or: [{ endDate: { $gte: now } }, { endDate: null }], // Chưa hết hạn
    }).sort({ requiredRank: -1 }); // Rank cao xếp trên

    // 4. 🔥 LỌC THỦ CÔNG (JS FILTER)
    // Loại bỏ những mã không còn dùng được với user này
    const validCoupons = coupons.filter((c) => {
      // Check 1: Đã hết tổng lượt dùng toàn sàn chưa?
      if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
        return false;
      }

      // Check 2: User này đã dùng hết lượt cá nhân chưa?
      const timesUsed = c.usedBy.filter(
        (id) => id.toString() === userId.toString()
      ).length;

      if (timesUsed >= c.maxUsagePerUser) {
        return false;
      }

      return true;
    });

    return validCoupons;
  },

  // --- ADMIN: CRUD ---
  async create(data) {
    const exists = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (exists) throw new ApiError(httpStatus.CONFLICT, "Mã này đã tồn tại");
    return await Coupon.create({ ...data, code: data.code.toUpperCase() });
  },

  async getAdminCoupons() {
    return await Coupon.find().sort({ createdAt: -1 });
  },

  async delete(id) {
    return await Coupon.findByIdAndDelete(id);
  },
};
