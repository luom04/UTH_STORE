import httpStatus from "http-status";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthService } from "../services/auth.service.js";
import { ok, created } from "../utils/apiResponse.js";

const setAuthCookies = (res, { accessToken, refreshToken }, cookieCfg) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: cookieCfg.secure,
    sameSite: cookieCfg.sameSite,
    domain: cookieCfg.domain,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: cookieCfg.secure,
    sameSite: cookieCfg.sameSite,
    domain: cookieCfg.domain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const user = await AuthService.register({ email, password, name });
  return created(res, { id: user._id, email: user.email, name: user.name });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await AuthService.verifyEmail({ token });
  return ok(res, { id: user._id, isEmailVerified: user.isEmailVerified });
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
    role: req.user.role,
    verified: req.user.isEmailVerified,
  });
});
