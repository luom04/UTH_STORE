import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
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
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 }, { unique: true });

export const Category = mongoose.model("Category", CategorySchema);
