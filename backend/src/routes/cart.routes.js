//src/routes/cart.routes.js
import { Router } from "express";
import passport from "passport";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { addItemSchema, putItemSchema } from "../validators/cart.schema.js";
import {
  getMyCart,
  addItem,
  putItem,
  removeItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }), requireAuth);

// GET giỏ hàng của tôi
router.get("/", getMyCart);

// Thêm item
router.post("/items", validate(addItemSchema), addItem);

// PUT sửa item (qty/options) — bạn đã thống nhất dùng PUT
router.put("/items/:itemId", validate(putItemSchema), putItem);

// Xoá item
router.delete("/items/:itemId", removeItem);

// Xoá sạch
router.delete("/clear", clearCart);

export default router;
