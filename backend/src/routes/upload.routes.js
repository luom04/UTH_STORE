// src/routes/upload.routes.js
import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  getSignedParams,
  deleteByPublicId,
} from "../controllers/upload.controller.js";

const router = Router();

/**
 * POST /api/uploads/sign-image
 * Lấy signature để client upload trực tiếp lên Cloudinary
 * Auth: Admin hoặc Staff
 */
router.post(
  "/sign-image",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin", "staff"),
  getSignedParams // ✅ Dùng controller (có logic ký đúng)
);

/**
 * POST /api/uploads/delete
 * Xóa ảnh khỏi Cloudinary bằng publicId
 * Body: { publicId, resourceType? }
 * Auth: Admin
 */
router.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  deleteByPublicId
);

export default router;
