// src/routes/product.routes.js
import { Router } from "express";
import passport from "passport";
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  suggestProducts,
} from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createProductSchema,
  updateProductSchema,
  idSchema,
} from "../validators/product.schema.js";
import { requireRoles } from "../middlewares/auth.middleware.js";
import { Product } from "../models/product.model.js";

const router = Router();

// ========================================
// 🚀 QUICK IMPORT ENDPOINTS (ADMIN ONLY)
// ========================================

// Import 1 sản phẩm - Tự động fix category & timestamps
// ✅ HELPER: Clean specs object
function cleanSpecs(specs) {
  if (!specs || typeof specs !== "object") return {};

  const cleaned = {};
  Object.entries(specs).forEach(([key, value]) => {
    // Chỉ giữ lại fields có value (không rỗng, không null)
    if (value !== "" && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

// ✅ HELPER: Validate required fields
function validateProduct(data, index = null) {
  const errors = [];
  const prefix = index !== null ? `Product ${index + 1}: ` : "";

  if (!data.title || data.title.trim() === "") {
    errors.push(`${prefix}title là bắt buộc`);
  }

  if (!data.slug || data.slug.trim() === "") {
    errors.push(`${prefix}slug là bắt buộc`);
  }

  if (!data.price || isNaN(data.price) || data.price < 0) {
    errors.push(`${prefix}price phải là số dương`);
  }

  // Validate slug format (lowercase, hyphens only)
  if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    errors.push(
      `${prefix}slug không hợp lệ (chỉ chứa a-z, 0-9, dấu gạch ngang)`
    );
  }

  return errors;
}

// ✅ 1. IMPORT 1 SẢN PHẨM (NÂNG CẤP TỪ BẢN CŨ)
router.post(
  "/quick-import",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  async (req, res) => {
    try {
      const productData = req.body;

      // ✅ Validate
      const errors = validateProduct(productData);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors,
        });
      }

      // ✅ Kiểm tra slug đã tồn tại chưa
      const existing = await Product.findOne({ slug: productData.slug });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `❌ Slug "${productData.slug}" đã tồn tại`,
          existingProduct: {
            id: existing._id,
            title: existing.title,
            slug: existing.slug,
          },
        });
      }

      // ✅ Tự động fix category về lowercase
      if (productData.category) {
        productData.category = productData.category.toLowerCase().trim();
      }

      // ✅ Clean specs (xóa trường rỗng)
      if (productData.specs) {
        productData.specs = cleanSpecs(productData.specs);
      }

      // ✅ Chuẩn hóa brand
      if (productData.brand) {
        productData.brand = productData.brand.trim();
      }

      // ✅ Default values
      if (!productData.stock) productData.stock = 0;
      if (!productData.status) productData.status = "active";
      if (productData.isFeatured === undefined) productData.isFeatured = false;

      // ✅ Tạo sản phẩm (Mongoose tự thêm createdAt, updatedAt)
      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: "✅ Import sản phẩm thành công!",
        data: {
          id: product._id,
          title: product.title,
          slug: product.slug,
          category: product.category,
          price: product.price,
          priceSale: product.priceSale,
          discountPercent: product.discountPercent,
          createdAt: product.createdAt,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi quick-import:", error);

      // Handle duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `❌ ${field} đã tồn tại trong hệ thống`,
          error: error.message,
        });
      }

      res.status(400).json({
        success: false,
        message: "Import thất bại",
        error: error.message,
      });
    }
  }
);

// ========================================
// PUBLIC ROUTES
// ========================================

router.get("/search", suggestProducts);

// List (public) + filter/sort/paginate/fields via query
router.get("/", listProducts);

// Get by id (public)
router.get("/:id", validate(idSchema), getProduct);

// ========================================
// ADMIN ROUTES
// ========================================

// Admin required for write operations
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(idSchema),
  deleteProduct
);

// ✅ STAFF + ADMIN được phép cập nhật tồn kho
router.put(
  "/:id/stock",
  passport.authenticate("jwt", { session: false }),
  requireRoles("staff", "admin"),
  updateProductStock
);

export default router;
