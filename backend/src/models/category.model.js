// src/models/category.model.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // image: {
    //   type: String,
    //   default: "",
    // },
    // icon: {
    //   type: String, // Icon class name (lucide-react hoặc emoji)
    //   default: "",
    // },
    // Parent category (nếu muốn làm nested categories)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    // Thứ tự hiển thị
    order: {
      type: Number,
      default: 0,
    },
    // Trạng thái
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    // SEO
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    // Statistics (tự động tính)
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ status: 1, order: 1 });
CategorySchema.index({ parent: 1 });

// Virtual: products
CategorySchema.virtual("products", {
  ref: "Product",
  localField: "slug",
  foreignField: "category",
});

// Method: Update product count
CategorySchema.methods.updateProductCount = async function () {
  const Product = mongoose.model("Product");
  this.productCount = await Product.countDocuments({ category: this.slug });
  await this.save();
};

export const Category = mongoose.model("Category", CategorySchema);
