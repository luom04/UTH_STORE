import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";

export const requireAuth = (req, res, next) => {
  if (!req.user) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  next();
};

export const requireRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    if (!roles.includes(req.user.role))
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
    next();
  };
