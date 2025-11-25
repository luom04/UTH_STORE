import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { requireRoles } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(requireRoles("admin", "staff")); // Staff cũng được xem Dashboard

router.get("/", getDashboardStats);

export default router;
