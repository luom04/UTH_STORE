//src/models/order.model.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: String,
    // ✅ giá sau HSSV (giá thực trả)
    price: { type: Number, required: true },

    // ✅ snapshot để hiển thị "giá gốc trước HSSV"
    originalPrice: { type: Number, default: 0 },

    // ✅ snapshot giảm HSSV theo từng sp
    studentDiscountPerUnit: { type: Number, default: 0 },

    // ✅ để FE dùng link đúng
    slug: String,
    image: String,
    qty: { type: Number, default: 1, min: 1 },
    subtotal: { type: Number, required: true },
    options: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    district: String,
    city: String,
    country: { type: String, default: "VN" },
    postalCode: String,
  },
  { _id: false }
);

const StatusHistorySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    by: { type: String, default: "system" }, // userId/adminId/system
    from: String,
    to: String,
    note: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    couponCode: { type: String, uppercase: true, trim: true },
    discountAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "VND" },

    shippingAddress: AddressSchema,
    note: String,

    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay", "momo"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "pending"],
      default: "unpaid",
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentDetails: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipping",
        "completed",
        "canceled",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    // 🔥 Thông tin hủy đơn (thêm mới)
    canceledAt: { type: Date },
    cancelReason: { type: String, trim: true },
    canceledByType: {
      type: String,
      enum: ["customer", "admin", "system"],
    },

    statusHistory: { type: [StatusHistorySchema], default: [] },

    expiresAt: { type: Date, index: { expireAfterSeconds: 0 }, default: null },

    gateway: {
      provider: String,
      transactionId: String,
      raw: mongoose.Schema.Types.Mixed,
    },
    studentDiscountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model("Order", OrderSchema);
