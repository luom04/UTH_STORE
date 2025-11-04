// backend/src/routes/staff.routes.js
import { Router } from "express";
import passport from "passport";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getStaffs,
  createStaff,
  updateStaff,
  toggleActive,
  deleteStaff,
} from "../controllers/staff.controller.js";

const router = Router();

// Tất cả routes đều cần authentication
router.use(passport.authenticate("jwt", { session: false }));
router.use(requireAuth);

// GET /api/staffs - Admin only
router.get("/", requireRoles(ROLES.ADMIN), getStaffs);

// POST /api/staffs - Admin only (tạo nhân viên)
router.post("/", requireRoles(ROLES.ADMIN), createStaff);

// PATCH /api/staffs/:id - Admin only (update role, name)
router.patch("/:id", requireRoles(ROLES.ADMIN), updateStaff);

// PUT /api/staffs/:id/toggle-active - Admin only
router.put("/:id/toggle-active", requireRoles(ROLES.ADMIN), toggleActive);

// POST /api/staffs/:id/reset-password - Admin only
// router.post("/:id/reset-password", requireRoles(ROLES.ADMIN), resetPassword);

// DELETE /api/staffs/:id - Admin only
router.delete("/:id", requireRoles(ROLES.ADMIN), deleteStaff);

export default router;
