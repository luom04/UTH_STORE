// backend/src/routes/coupon.routes.js
import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  createCoupon,
  getAdminCoupons,
  deleteCoupon,
  getMyCoupons,
  checkCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// User Route: Lấy mã trong ví
router.get("/available", getMyCoupons);
router.post("/check", checkCoupon); // User check mã
// Admin Routes
router.get("/admin", requireRoles("admin", "staff"), getAdminCoupons);
router.post("/", requireRoles("admin"), createCoupon);
router.delete("/:id", requireRoles("admin"), deleteCoupon);

export default router;
