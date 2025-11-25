// backend / src / models / coupon.model.js;
import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    }, // VD: VIP_GOLD_2025
    description: { type: String, required: true }, // VD: Giảm 10% tối đa 500k

    discountType: {
      type: String,
      enum: ["percent", "amount"],
      required: true,
    },
    value: { type: Number, required: true }, // 10 (10%) hoặc 50000 (50k)
    maxDiscountAmount: { type: Number, default: 0 }, // Chỉ dùng cho type percent
    minOrderValue: { type: Number, default: 0 },

    // 🌟 Điều kiện Hạng để thấy mã này
    requiredRank: {
      type: String,
      enum: ["MEMBER", "SILVER", "GOLD", "DIAMOND"],
      default: "MEMBER",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // Nếu null = vĩnh viễn

    usageLimit: { type: Number, default: 0 }, // 0 = vô hạn
    usedCount: { type: Number, default: 0 },

    // ✅ THÊM MỚI: Danh sách user đã dùng
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ THÊM MỚI: Giới hạn số lần dùng cho mỗi người (Mặc định 1 lần)
    maxUsagePerUser: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", CouponSchema);
