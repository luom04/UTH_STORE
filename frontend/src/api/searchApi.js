// src/api/search.js
import axiosInstance from "./axiosInstance";

// Dùng chung endpoint /products (BE đã có ApiFeatures)
const SEARCH_ENDPOINT = "/products";

/**
 * Gợi ý tìm kiếm dùng ApiFeatures ở BE
 * - q: từ khoá (BE match title/slug/brand/description bằng regex)
 * - limit: số kết quả
 * - extra: truyền thêm filter nếu cần (category, brand, stock, status...)
 */
export async function apiSearchSuggest({ q, limit = 8, extra = {} } = {}) {
  if (!q?.trim()) return { data: [] };

  const params = {
    q,
    page: 1,
    limit, // ApiFeatures.paginate()
    status: "active", // lọc active (ApiFeatures.filter)
    sort: "-sold,-updatedAt", // ApiFeatures.sort()
    // chỉ lấy field cần cho dropdown (ApiFeatures.limitFields)
    fields: "title,slug,images,price,priceSale,brand",
    ...extra, // có thể truyền thêm: category, brand, stock=in/out...
  };

  const res = await axiosInstance.get(SEARCH_ENDPOINT, { params });

  // Chuẩn hoá payload theo ok() ở BE: { success, data, meta }
  const payload = res.data || {};
  const items = payload.data || payload.items || [];
  return { data: items };
}
