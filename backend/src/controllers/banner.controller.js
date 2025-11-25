import { BannerService } from "../services/banner.service.js"; // ✅ Import Service
import { asyncHandler } from "../utils/asyncHandler.js";

// Public: Lấy danh sách banner active
export const getPublicBanners = asyncHandler(async (req, res) => {
  const banners = await BannerService.getPublicBanners();
  res.json({ success: true, data: banners });
});

// Admin: Lấy tất cả
export const getAdminBanners = asyncHandler(async (req, res) => {
  const banners = await BannerService.getAdminBanners();
  res.json({ success: true, data: banners });
});

// Admin: Tạo mới
export const createBanner = asyncHandler(async (req, res) => {
  const banner = await BannerService.create(req.body);
  res.status(201).json({
    success: true,
    data: banner,
    message: "Tạo banner thành công",
  });
});

// Admin: Cập nhật
export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await BannerService.update(id, req.body);
  res.json({
    success: true,
    data: banner,
    message: "Cập nhật thành công",
  });
});

// Admin: Xóa
export const deleteBanner = asyncHandler(async (req, res) => {
  await BannerService.delete(req.params.id);
  res.json({ success: true, message: "Đã xóa banner" });
});
