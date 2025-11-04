// backend/src/middlewares/auth.middleware.js
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";

/**
 * Require user phải đăng nhập
 */
export const requireAuth = (req, _res, next) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  // ✅ CHECK: User có bị khoá không?
  if (!req.user.isEmailVerified) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been locked. Please contact administrator."
    );
  }

  next();
};

/**
 * Require user có role cụ thể
 */
export const requireRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    // ✅ CHECK: User có bị khoá không?
    if (!req.user.isEmailVerified) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Your account has been locked. Please contact administrator."
      );
    }

    // Check role
    const allowed = roles.map((r) => String(r).toLowerCase());
    const current = String(req.user.role || "").toLowerCase();

    if (!allowed.includes(current)) {
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
    }

    next();
  };
