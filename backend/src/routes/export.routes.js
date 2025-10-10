import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  exportProducts,
  exportCategories,
  exportBrands,
  exportOrders,
} from "../controllers/export.controller.js";

const router = Router();
router.use(
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin")
);

router.get("/products.xlsx", exportProducts);
router.get("/categories.xlsx", exportCategories);
router.get("/brands.xlsx", exportBrands);
router.get("/orders.xlsx", exportOrders);

export default router;
