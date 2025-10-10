import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

BrandSchema.index({ slug: 1 }, { unique: true });

export const Brand = mongoose.model("Brand", BrandSchema);
