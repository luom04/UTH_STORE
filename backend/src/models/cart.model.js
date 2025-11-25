//src/models/cart.model.js
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: String, // snapshot để hiển thị nhanh
    price: Number, // snapshot (đã tính sale nếu có)
    image: String, // 1 ảnh đại diện
    qty: { type: Number, default: 1, min: 1 },
    // options (VD: màu/ram/ssd...), tuỳ dự án
    options: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: true, timestamps: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
    itemsTotal: { type: Number, default: 0 }, // sum(items.price * qty)
    shippingFee: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    currency: { type: String, default: "VND" },
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", CartSchema);
