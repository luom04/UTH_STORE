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
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: cookieCfg.secure,
    sameSite: cookieCfg.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const user = await AuthService.register({ email, password, name });
  return created(res, { id: user._id, email: user.email, name: user.name });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;
  const result = await AuthService.verifyEmail(token);
  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
});

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

// ✅ [SỬA LẠI] Hàm me: Gọi Service để lấy Rank + TotalSpent
export const me = asyncHandler(async (req, res) => {
  // req.user._id có được từ middleware xác thực (JWT)
  const data = await AuthService.getMe(req.user._id);

  // data trả về sẽ có dạng: { ...userInfo, totalSpent, rank }
  return ok(res, data);
});

export const updateMe = asyncHandler(async (req, res) => {
  const updated = await AuthService.updateMe(req.user._id, req.body);
  return ok(res, updated);
});

// [CUSTOMER] Gửi yêu cầu xác thực
export const requestStudentVerify = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Lấy từ token

  // ✅ gọi service đúng flow
  const result = await AuthService.requestStudentVerify(userId, req.body);

  res.status(200).json({
    success: true,
    message: "Gửi yêu cầu thành công! Vui lòng chờ Admin xét duyệt.",
    data: result,
  });
});

// [ADMIN] Duyệt yêu cầu
export const verifyStudentRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  // ✅ gọi service đúng flow
  const result = await AuthService.verifyStudentRequest(id, {
    status,
    reason,
  });

  const msg =
    status === "verified"
      ? "Đã duyệt yêu cầu thành công"
      : "Đã từ chối yêu cầu";

  res.status(200).json({
    success: true,
    message: msg,
    data: result,
  });
});

// [ADMIN] Lấy danh sách chờ
export const getPendingStudentRequests = asyncHandler(async (req, res) => {
  // ✅ gọi service đúng flow
  const list = await AuthService.getPendingStudentRequests();

  res.status(200).json({
    success: true,
    data: list,
  });
});
