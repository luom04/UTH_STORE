// src/api/search.js
import axiosInstance from "./axiosInstance";

const SEARCH_ENDPOINT = "/products";

/**
 * API Tìm kiếm cho trang Search Result
 * - q: từ khóa
 * - limit: số lượng hiển thị
 * - page: trang hiện tại (mặc định 1)
 */
export async function apiSearchProducts({ q, limit = 12, page = 1 }) {
  const params = {
    q: q || "",
    page,
    limit,
    status: "active",
    sort: "-createdAt", // Sắp xếp mới nhất
    // Không giới hạn fields quá chặt để ProductCard có đủ thông tin (ảnh, giá, specs...)
  };

  const res = await axiosInstance.get(SEARCH_ENDPOINT, { params });

  // Giả sử BE trả về: { success: true, data: [...], meta: { total, totalPages, ... } }
  // Hoặc { data: [...], pagination: {...} } tùy cấu trúc BE của bạn.
  // Ở đây mình return nguyên cục data để Hook xử lý.
  return res.data;
}

/**
 * API Gợi ý (Dropdown) - Giữ nguyên code cũ của bạn
 */
export async function apiSearchSuggest({ q, limit = 8, extra = {} } = {}) {
  if (!q?.trim()) return { data: [] };

  const params = {
    q,
    page: 1,
    limit,
    status: "active",
    sort: "-sold,-updatedAt",
    fields: "title,slug,images,price,priceSale,brand,category",
    ...extra,
  };

  const res = await axiosInstance.get(SEARCH_ENDPOINT, { params });
  const payload = res.data || {};
  const items = payload.data || payload.items || [];
  return { data: items };
}
