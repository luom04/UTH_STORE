// src/routes/auth.routes.js
import { Router } from "express";
import passport from "passport";
import { AuthService } from "../services/auth.service.js";
import { requireRoles } from "../middlewares/auth.middleware.js";
// Import dạng named từ controller
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  updateMe,
  resendVerification,
  requestStudentVerify,
  verifyStudentRequest,
  getPendingStudentRequests,
} from "../controllers/auth.controller.js";

const router = Router();

// B1: redirect user sang Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// B2: Google gọi về callback -> phát hành cookie JWT giống /login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google`,
  }),
  async (req, res) => {
    const ip = req.ip;
    const ua = req.headers["user-agent"];
    const tokens = await AuthService.issueTokens(req.user._id, ip, ua);
    const cookieCfg = req.app.get("cookieCfg");

    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: cookieCfg.secure,
      sameSite: cookieCfg.sameSite,
      domain: cookieCfg.domain,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: cookieCfg.secure,
      sameSite: cookieCfg.sameSite,
      domain: cookieCfg.domain,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // chuyển user về FE
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
  }
);

router.post(
  "/student-request",
  passport.authenticate("jwt", { session: false }),
  requireRoles("customer"),
  requestStudentVerify
);

// ✅ ADMIN: thêm passport để đảm bảo có req.user trước requireRoles
router.get(
  "/admin/student-requests",
  passport.authenticate("jwt", { session: false }), // ✅ thêm dòng này
  requireRoles("admin", "staff"),
  getPendingStudentRequests
);

router.put(
  "/admin/verify-student/:id",
  passport.authenticate("jwt", { session: false }), // ✅ thêm dòng này
  requireRoles("admin"),
  verifyStudentRequest
);

// Auth routes (KHÔNG có prefix /api/v1 ở đây; prefix gắn ở app.use('/api/v1', routes))
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification); // ✅ NEW
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Route cần JWT cookie
router.get("/me", passport.authenticate("jwt", { session: false }), me);
router.put("/me", passport.authenticate("jwt", { session: false }), updateMe);

export default router;
