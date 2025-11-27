// controllers/dashboard.controller.js
import { DashboardService } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  // ✅ Lấy userId từ token
  const userId = req.user._id;
  const stats = await DashboardService.getStats(userId);
  const chart = await DashboardService.getRevenueChart();
  res.json({ success: true, data: { ...stats, chart } });
});

// ✅ Controller mới: lưu ghi chú (thêm mới)
export const updateDashboardNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  const note = await DashboardService.saveNote(userId, content);

  res.json({ success: true, message: "Đã lưu ghi chú thành công", data: note });
});

// ✅ Controller mới: sửa ghi chú
export const editDashboardNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const note = await DashboardService.updateNote(userId, noteId, content);
  res.json({ success: true, message: "Đã cập nhật ghi chú", data: note });
});

// ✅ Controller mới: xóa ghi chú
export const deleteDashboardNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  await DashboardService.deleteNote(userId, noteId);
  res.json({ success: true, message: "Đã xóa ghi chú" });
});
