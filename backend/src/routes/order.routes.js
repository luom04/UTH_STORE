// src/routes/order.routes.js
import { Router } from "express";
import passport from "passport";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.schema.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminOrderStats,
} from "../controllers/order.controller.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Middleware auth cho tất cả routes
router.use(passport.authenticate("jwt", { session: false }), requireAuth);

// ============================================
// USER ROUTES (Customer)
// ============================================

/**
 * Tạo đơn hàng mới
 * POST /api/orders
 * Access: User đã login
 */
router.post("/", validate(createOrderSchema), createOrder);

/**
 * Lấy danh sách đơn hàng của tôi
 * GET /api/orders
 * Access: User đã login
 */
router.get("/", getMyOrders);

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/:id
 * Access: User đã login (chỉ xem đơn của mình)
 */
router.get("/:id", getOrderById);

/**
 * Hủy đơn hàng
 * PUT /api/orders/:id/cancel
 * Access: User đã login (chỉ hủy đơn của mình, status = pending)
 */
router.put("/:id/cancel", cancelOrder);

// ============================================
// ADMIN/STAFF ROUTES
// ============================================

/**
 * Lấy tất cả đơn hàng (có filter, search, pagination)
 * GET /api/orders/admin/all
 * Access: Admin/Staff only
 */
router.get(
  "/admin/stats",
  requireRoles(ROLES.ADMIN, ROLES.STAFF),
  getAdminOrderStats
);
router.get("/admin/all", requireRoles(ROLES.ADMIN, ROLES.STAFF), getAllOrders);

/**
 * Cập nhật trạng thái đơn hàng
 * PUT /api/orders/admin/:id/status
 * Access: Admin/Staff only
 */
router.put(
  "/admin/:id/status",
  requireRoles(ROLES.ADMIN, ROLES.STAFF),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
