// src/routes/route_admin/order.admin.routes.js
import { Router } from "express";
import passport from "passport";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  listAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const r = Router();

r.use(
  passport.authenticate("jwt", { session: false }),
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.STAFF)
);

r.get("/", listAllOrders);
r.patch("/:id/status", updateOrderStatus);
r.post("/:id/confirm", (req, res, next) => {
  req.body.status = "confirmed";
  return updateOrderStatus(req, res, next);
});

export default r;
