// src/models/product.model.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    priceSale: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] }, // URL ảnh
    category: { type: String, index: true },
    brand: { type: String, index: true },
    specs: { type: mongoose.Schema.Types.Mixed }, // object thông số linh kiện
    status: {
      type: String,
      enum: ["active", "draft", "hidden"],
      default: "active",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    sold: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({
  category: 1,
  brand: 1,
  price: 1,
  isFeatured: 1,
  status: 1,
});
export const Product = mongoose.model("Product", ProductSchema);
