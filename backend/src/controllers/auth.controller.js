//src/controllers/auth.controller.js
import httpStatus from "http-status";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthService } from "../services/auth.service.js";
import { ok, created } from "../utils/apiResponse.js";
import catchAsync from "../utils/catchAsync.js";

const setAuthCookies = (res, { accessToken, refreshToken }, cookieCfg) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: cookieCfg.secure,
    sameSite: cookieCfg.sameSite,
    // domain: cookieCfg.domain,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: cookieCfg.secure,
    sameSite: cookieCfg.sameSite,
    // domain: cookieCfg.domain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const user = await AuthService.register({ email, password, name });
  return created(res, { id: user._id, email: user.email, name: user.name });
});

// backend/src/controllers/auth.controller.js

export const verifyEmail = catchAsync(async (req, res) => {
  console.log("=== CONTROLLER ===");
  console.log("req.body:", req.body);
  console.log("req.body type:", typeof req.body);
  console.log("==================");

  const { token } = req.body;

  console.log("=== EXTRACTED TOKEN ===");
  console.log("token:", token);
  console.log("token type:", typeof token);
  console.log("=======================");

  const result = await AuthService.verifyEmail(token);

  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
});

/**
 * POST /api/auth/resend-verification
 * Body: { email: "..." }
 */
export const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.resendVerificationEmail(email);

  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const ua = req.headers["user-agent"];
  const result = await AuthService.login({ email, password, ip, ua });
  setAuthCookies(res, result, req.app.get("cookieCfg"));
  return ok(res, result.user);
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  const ip = req.ip;
  const ua = req.headers["user-agent"];
  const tokens = await AuthService.refresh({ refreshToken, ip, ua });
  setAuthCookies(res, tokens, req.app.get("cookieCfg"));
  return ok(res, { refreshed: true });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.requestPasswordReset({ email });
  return ok(res, result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const r = await AuthService.resetPassword({ token, newPassword });
  // clear cookies nếu đang đăng nhập ở browser hiện tại
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return ok(res, r);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  await AuthService.logout({ refreshToken });
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return ok(res, { loggedOut: true });
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: String(req.user.role || "").toLowerCase(), // 👈
    verified: req.user.isEmailVerified,
    phone: req.user.phone,
    gender: req.user.gender,
    dob: req.user.dob,
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const updated = await AuthService.updateMe(req.user._id, req.body);
  return ok(res, updated);
});
