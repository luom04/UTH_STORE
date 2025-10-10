import mongoose from "mongoose";
import crypto from "crypto";

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    family: { type: String, index: true }, // rotation chain id
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    used: { type: Boolean, default: false },
    ip: String,
    ua: String,
  },
  { timestamps: true }
);

RefreshTokenSchema.statics.hash = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

const EmailTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    type: { type: String, enum: ["verify", "reset"], required: true },
  },
  { timestamps: true }
);

export const EmailToken = mongoose.model("EmailToken", EmailTokenSchema);
