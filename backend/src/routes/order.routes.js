import { Router } from "express";
import passport from "passport";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.schema.js";
import {
  myOrders,
  createOrder,
  getMyOrder,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

// User
router.use(passport.authenticate("jwt", { session: false }), requireAuth);
router.get("/mine", myOrders);
router.post("/", validate(createOrderSchema), createOrder);
router.get("/:id", getMyOrder);

// Admin
router.get("/", requireRoles("admin"), listAllOrders);
router.put(
  "/:id/status",
  requireRoles("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
