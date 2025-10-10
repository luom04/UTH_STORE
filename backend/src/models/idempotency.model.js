import mongoose from "mongoose";
const IdemSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export const Idempotency = mongoose.model("Idempotency", IdemSchema);
