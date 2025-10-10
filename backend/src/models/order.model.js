import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: String,
    price: Number,
    image: String,
    qty: { type: Number, default: 1, min: 1 },
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
    orderNumber: { type: String, unique: true, index: true }, // ví dụ: UTH-20251010-000123
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "VND" },

    shippingAddress: AddressSchema,
    note: String,

    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
      index: true,
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

    statusHistory: { type: [StatusHistorySchema], default: [] },

    // auto-cancel nếu quá hạn thanh toán (optional)
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 }, default: null },

    gateway: {
      provider: String,
      transactionId: String,
      raw: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model("Order", OrderSchema);
