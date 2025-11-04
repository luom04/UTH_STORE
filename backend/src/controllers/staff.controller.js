// backend/src/controllers/staff.controller.js
import { StaffService } from "../services/staff.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";

/**
 * GET /api/staffs
 * Lấy danh sách nhân viên
 */
export const getStaffs = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, q = "" } = req.query;

  const result = await StaffService.getStaffs({
    page: Number(page),
    limit: Number(limit),
    q: String(q),
  });

  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
});

/**
 * POST /api/staffs
 * Tạo nhân viên mới (admin only)
 */
export const createStaff = catchAsync(async (req, res) => {
  const { name, email, password, role, salary } = req.body;

  const staff = await StaffService.createStaff({
    name,
    email,
    password,
    role,
    salary,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: staff,
    message: "Staff created successfully",
  });
});

/**
 * PATCH /api/staffs/:id
 * Cập nhật thông tin nhân viên
 */
export const updateStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const staff = await StaffService.updateStaff(id, updates);

  res.status(httpStatus.OK).json({
    success: true,
    data: staff,
    message: "Staff updated successfully",
  });
});

/**
 * PUT /api/staffs/:id/toggle-active
 * Kích hoạt / Vô hiệu hóa nhân viên
 */
export const toggleActive = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  console.log("🔵 Toggle request:", { id, active }); // ✅ ADD
  const result = await StaffService.toggleActive(id, Boolean(active));
  console.log("✅ Toggle result:", result); // ✅ ADD
  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: `Staff ${active ? "activated" : "deactivated"} successfully`,
  });
});

/**
 * POST /api/staffs/:id/reset-password
 * Reset password nhân viên
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await StaffService.resetPassword(id);

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message:
      "Password reset successfully. Please send the new password to staff.",
  });
});

/**
 * DELETE /api/staffs/:id
 * Xóa nhân viên (soft delete)
 */
export const deleteStaff = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await StaffService.deleteStaff(id);

  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
});
