import { Banner } from "../models/banner.model.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";

export const BannerService = {
  /**
   * Lấy danh sách banner cho trang chủ (chỉ lấy cái đang Active)
   */
  async getPublicBanners() {
    // Sắp xếp theo thứ tự hiển thị (order) và ngày tạo mới nhất
    const banners = await Banner.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    return banners;
  },

  /**
   * Lấy tất cả banner cho Admin quản lý
   */
  async getAdminBanners() {
    // Sắp xếp theo loại rồi đến thứ tự
    const banners = await Banner.find().sort({ type: 1, order: 1 });
    return banners;
  },

  /**
   * Tạo banner mới
   */
  async create(data) {
    const banner = await Banner.create(data);
    return banner;
  },

  /**
   * Cập nhật banner
   */
  async update(id, data) {
    const banner = await Banner.findByIdAndUpdate(id, data, {
      new: true, // Trả về dữ liệu mới sau khi update
      runValidators: true,
    });

    if (!banner) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy banner");
    }
    return banner;
  },

  /**
   * Xóa banner
   */
  async delete(id) {
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy banner");
    }
    return banner;
  },
};
