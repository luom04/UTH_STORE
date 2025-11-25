import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller.js";

const router = Router();

// Public
router.get("/", getPublicBanners);

// Admin
router.use(
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin")
);
router.get("/admin", getAdminBanners);
router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

export default router;
