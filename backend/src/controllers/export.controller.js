// backend/src/controllers/export.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ExportService } from "../services/export.service.js"; // Import Service

// Helper function để set header (giữ nguyên)
const setDownloadHeaders = (res, filename) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
};

export const exportProducts = asyncHandler(async (req, res) => {
  // 1. Gọi Service
  const workbook = await ExportService.generateProductReport();

  // 2. Trả về Response
  setDownloadHeaders(res, "Bao_cao_ton_kho.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});

export const exportOrders = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;

  // 1. Gọi Service kèm tham số filter
  const workbook = await ExportService.generateOrderReport({
    from,
    to,
    status,
  });

  // 2. Trả về Response
  setDownloadHeaders(res, "Bao_cao_don_hang.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});

export const exportCategories = asyncHandler(async (req, res) => {
  const workbook = await ExportService.generateCategoryReport();
  setDownloadHeaders(res, "Danh_muc.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});

export const exportBrands = asyncHandler(async (req, res) => {
  const workbook = await ExportService.generateBrandReport();
  setDownloadHeaders(res, "Thuong_hieu.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});
