//sec/middleware/auth.middleware.js
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";

export const requireAuth = (req, _res, next) => {
  if (!req.user) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  next();
};

export const requireRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    const allowed = roles.map((r) => String(r).toLowerCase());
    const current = String(req.user.role || "").toLowerCase();
    if (!allowed.includes(current))
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
    next();
  };
