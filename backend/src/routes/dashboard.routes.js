import { Router } from "express";
import {
  getDashboardStats,
  updateDashboardNote,
  editDashboardNote,
  deleteDashboardNote,
} from "../controllers/dashboard.controller.js";
import { requireRoles } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(requireRoles("admin", "staff")); // Staff cũng được xem Dashboard

router.get("/", getDashboardStats);
router.post("/note", updateDashboardNote);
router.put("/note/:noteId", editDashboardNote);
router.delete("/note/:noteId", deleteDashboardNote);

export default router;
