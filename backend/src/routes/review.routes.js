// backend/src/routes/review.routes.js
import { Router } from "express";
import passport from "passport";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  getMyReviewController,
  upsertMyReviewController,
  getProductReviewsController,
  adminReplyReviewController,
  getAdminReviewsController,
  getAdminReviewStatsController,
  toggleReviewVisibilityController,
} from "../controllers/review.controller.js";
import {
  upsertReviewSchema,
  adminReplyReviewSchema,
} from "../validators/review.schema.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

/**
 * PUBLIC: xem review theo product (không cần login)
 * GET /api/reviews/product/:productId
 */
router.get("/product/:productId", getProductReviewsController);

// ====== Các route bên dưới require login ======
router.use(passport.authenticate("jwt", { session: false }), requireAuth);

/**
 * Lấy review của chính mình cho 1 product trong 1 đơn
 * GET /api/reviews/my?orderId=...&productId=...
 */
router.get("/my", getMyReviewController);

/**
 * Tạo / sửa (upsert) review
 * POST /api/reviews
 * body: { orderId, productId, rating, title, content, images }
 */
router.post("/", validate(upsertReviewSchema), upsertMyReviewController);

router.patch(
  "/admin/:id/visibility",
  requireRoles(ROLES.ADMIN, ROLES.STAFF),
  toggleReviewVisibilityController
);

/**
 * Admin/Staff: list review mới nhất
 * GET /api/reviews/admin
 */
router.get(
  "/admin",
  requireRoles(ROLES.ADMIN, ROLES.STAFF),
  getAdminReviewsController
);

router.get(
  "/admin/stats",
  requireRoles(ROLES.ADMIN, ROLES.STAFF),
  getAdminReviewStatsController
);

/**
 * Admin/Staff: trả lời / sửa trả lời review
 * PUT /api/reviews/admin/:id/reply
 */
router.put(
  "/admin/:id/reply",
  requireRoles(ROLES.ADMIN, ROLES.STAFF),
  validate(adminReplyReviewSchema),
  adminReplyReviewController
);

export default router;
