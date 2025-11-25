// src/models/review.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Rating 1-5 sao
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    title: {
      type: String,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
    },

    // URL ảnh đính kèm review (FE upload lên Cloudinary rồi gửi URL xuống)
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    // Đánh dấu đã mua hàng thật (dựa vào order completed)
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true, // Mặc định hiện
      index: true,
    },
    adminReply: {
      content: { type: String, trim: true },
      repliedAt: { type: Date },
      repliedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin / Staff
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo 1 user chỉ review 1 lần cho 1 sản phẩm trong 1 đơn
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
