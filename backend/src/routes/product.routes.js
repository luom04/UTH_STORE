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
router.post(
  "/quick-import",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  async (req, res) => {
    try {
      const productData = req.body;

      // ✅ Tự động fix category về lowercase
      if (productData.category) {
        productData.category = productData.category.toLowerCase();
      }

      // ✅ Xóa các trường specs trống
      if (productData.specs) {
        Object.keys(productData.specs).forEach((key) => {
          if (
            productData.specs[key] === "" ||
            productData.specs[key] === null
          ) {
            delete productData.specs[key];
          }
        });
      }

      // ✅ Mongoose tự động thêm createdAt, updatedAt
      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: "✅ Import sản phẩm thành công!",
        data: product,
      });
    } catch (error) {
      console.error("❌ Lỗi quick-import:", error);
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
