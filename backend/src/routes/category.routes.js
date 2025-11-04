// src/routes/category.routes.js
import { Router } from "express";
import passport from "passport";
import {
  createCategory,
  listCategories,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  updateProductCounts,
} from "../controllers/category.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
  idSchema,
} from "../validators/category.schema.js";
import { requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// List categories (public)
router.get("/", listCategories);

// Get category tree (nested, public)
router.get("/tree", getCategoryTree);

// Get by slug (public)
router.get("/slug/:slug", getCategoryBySlug);

// Get by id (public)
router.get("/:id", validate(idSchema), getCategory);

// ========================================
// ADMIN ROUTES
// ========================================

// Admin only: create
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(createCategorySchema),
  createCategory
);

// Admin only: update
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(updateCategorySchema),
  updateCategory
);

// Admin only: delete
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(idSchema),
  deleteCategory
);

// Admin only: update product counts
router.post(
  "/update-counts",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  updateProductCounts
);

export default router;
