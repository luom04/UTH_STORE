// src/routes/upload.routes.js
import { Router } from "express";
import passport from "passport";
import { validate } from "../middlewares/validate.js";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import {
  signParamsSchema,
  deleteByPublicIdSchema,
} from "../validators/upload.schema.js";
import {
  getSignedParams,
  deleteByPublicId,
} from "../controllers/upload.controller.js";

const router = Router();

/**
 * Lấy chữ ký (signed params) để FE upload trực tiếp lên Cloudinary
 * – Chỉ cần user đã đăng nhập (tùy bạn: có thể để public nếu không sợ abuse)
 */
router.post(
  "/signature",
  passport.authenticate("jwt", { session: false }),
  requireAuth,
  validate(signParamsSchema),
  getSignedParams
);

/**
 * Xóa ảnh theo public_id
 * – Chỉ admin
 */
router.delete(
  "/by-public-id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(deleteByPublicIdSchema),
  deleteByPublicId
);

export default router;
