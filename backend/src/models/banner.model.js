import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String, required: true }, // URL ảnh (Cloudinary)
    linkType: {
      type: String,
      enum: ["PRODUCT", "CATEGORY", "EXTERNAL", "CUSTOM"], // Product Detail | Catalog Filter | Link ngoài | Link nội bộ khác
      default: "CATEGORY",
    },
    // Giá trị tương ứng: slug sản phẩm, slug danh mục, hoặc full URL
    linkValue: { type: String, default: "" },
    // ✅ NEW: nếu banner là promotion thì có thể gắn voucher
    couponCode: { type: String, default: "", uppercase: true, trim: true },
    // Phân loại vị trí hiển thị
    type: {
      type: String,
      enum: ["slider", "right", "bottom"],
      default: "slider",
      required: true,
    },

    order: { type: Number, default: 0 }, // Để sắp xếp thứ tự
    isActive: { type: Boolean, default: true }, // Ẩn/Hiện
  },
  { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);
