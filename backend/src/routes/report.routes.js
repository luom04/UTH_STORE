// backend/src/routes/report.routes.js
import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import { getInventoryReport } from "../controllers/report.controller.js";

const router = Router();

// Admin + staff được xem báo cáo (không export)
router.use(
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin", "staff")
);

// GET /api/reports/inventory
router.get("/inventory", getInventoryReport);

export default router;
