//src/routes/payment.routes.js
import express from "express";
import passport from "passport";
import paymentController from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js"; // Đổi thành requireAuth

const router = express.Router();

// Route tạo thanh toán VNPay (yêu cầu đăng nhập)
router.post(
  "/vnpay/create",
  passport.authenticate("jwt", { session: false }),
  requireAuth, // Đổi thành requireAuth
  paymentController.createVNPayPayment
);

// Route xử lý return từ VNPay (không cần authenticate vì VNPay redirect)
router.get("/vnpay/return", paymentController.vnpayReturn);

// Route xử lý IPN từ VNPay (webhook - không cần authenticate)
router.get("/vnpay/ipn", paymentController.vnpayIPN);

// ====================== MoMo Payment ======================
router.post(
  "/momo/create",
  passport.authenticate("jwt", { session: false }),
  requireAuth,
  paymentController.createMoMoPayment
);

router.get("/momo/return", paymentController.momoReturn);
router.post("/momo/ipn", paymentController.momoIPN);

export default router;
