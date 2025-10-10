import httpStatus from "http-status";

export class ApiError extends Error {
  constructor(
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    message = "Unexpected error",
    details
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
