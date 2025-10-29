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

const router = Router();

// List (public) + filter/sort/paginate/fields via query
router.get("/", listProducts);

// Get by id (public)
router.get("/:id", validate(idSchema), getProduct);

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
