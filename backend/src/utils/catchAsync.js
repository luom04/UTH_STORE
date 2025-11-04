// backend/src/utils/catchAsync.js
/**
 * Wrapper cho async route handlers
 * Tự động catch errors và pass sang error handler middleware
 *
 * @param {Function} fn - Async function (req, res, next)
 * @returns {Function} Express middleware
 *
 * @example
 * export const getUsers = catchAsync(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * });
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
