import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { requireRoles } from "../middlewares/auth.middleware.js"; // Middleware check quyền của bạn
import passport from "passport";

const router = Router();

// API Public: Lấy lịch sử chat của khách (dựa theo sessionId)
router.get("/history/:sessionId", ChatController.getHistory);

// API Private (Admin): Lấy danh sách các đoạn chat đang hoạt động
router.get(
  "/admin/active",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin", "staff"), // Chỉ admin/staff mới xem được
  ChatController.getActiveChats
);

// API Private (Admin): Xóa (ẩn) 1 cuộc trò chuyện khỏi dashboard
router.delete(
  "/admin/:sessionId",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"), // ✅ chỉ admin, không cho staff
  ChatController.archiveChat
);

export default router;
