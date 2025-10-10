import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";

export const notFound = (req, res, next) =>
  next(new ApiError(httpStatus.NOT_FOUND, "Route not found"));

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV !== "test") console.error(err);
  res.status(status).json({ success: false, message, details: err.details });
};
