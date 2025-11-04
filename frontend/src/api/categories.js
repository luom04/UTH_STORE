// src/api/categories.js
// ✅ SHARED API - Dùng cho cả Admin và Public

import axiosInstance from "./axiosInstance";

// ============================================
// PUBLIC APIs (không cần auth)
// ============================================

/**
 * Lấy danh sách categories (Public - active only)
 * Dùng cho: Header, Sidebar, Filter, HomePage...
 */
export async function apiGetCategories() {
  const res = await axiosInstance.get("/categories", {
    params: {
      status: "active",
      sort: "order",
      limit: 100,
    },
  });
  return res.data;
}

/**
 * Lấy category tree (nested structure)
 * Dùng cho: Mega menu, nested navigation...
 */
export async function apiGetCategoryTree() {
  const res = await axiosInstance.get("/categories/tree");
  return res.data;
}

/**
 * Lấy 1 category theo slug
 * Dùng cho: Category detail page
 */
export async function apiGetCategoryBySlug(slug) {
  if (!slug) throw new Error("Slug is required");
  const res = await axiosInstance.get(`/categories/slug/${slug}`);
  return res.data;
}

// ============================================
// ADMIN APIs (cần auth)
// ============================================

/**
 * Lấy danh sách categories (Admin - full access)
 * Dùng cho: Admin categories management
 */
export async function apiGetCategoriesAdmin(params = {}) {
  const { page = 1, limit = 50, status } = params;

  const queryParams = { page, limit, sort: "order" };
  if (status) queryParams.status = status;

  const res = await axiosInstance.get("/categories", { params: queryParams });
  return res.data;
}

/**
 * Lấy 1 category theo ID (Admin)
 */
export async function apiGetCategoryById(id) {
  if (!id) throw new Error("ID is required");
  const res = await axiosInstance.get(`/categories/${id}`);
  return res.data;
}

/**
 * Tạo category mới (Admin only)
 */
export async function apiCreateCategory(data) {
  const body = {
    name: data.name,
    slug: data.slug || undefined,
    description: data.description || "",
    // image: data.image || "",
    // icon: data.icon || "",
    parent: data.parent || null,
    order: Number(data.order) || 0,
    status: data.status || "active",
    seo: data.seo || undefined,
  };

  // Remove undefined fields
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });

  const res = await axiosInstance.post("/categories", body);
  return res.data;
}

/**
 * Cập nhật category (Admin only)
 */
export async function apiUpdateCategory(id, data) {
  if (!id) throw new Error("ID is required");

  const body = {
    name: data.name,
    slug: data.slug || undefined,
    description: data.description || "",
    // image: data.image || "",
    // icon: data.icon || "",
    parent: data.parent || null,
    order: Number(data.order) || 0,
    status: data.status || "active",
    seo: data.seo || undefined,
  };

  // Remove undefined fields
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });

  const res = await axiosInstance.put(`/categories/${id}`, body);
  return res.data;
}

/**
 * Xóa category (Admin only)
 */
export async function apiDeleteCategory(id) {
  if (!id) throw new Error("ID is required");
  const res = await axiosInstance.delete(`/categories/${id}`);
  return res.data;
}

/**
 * Cập nhật product count (Admin only)
 */
export async function apiUpdateCategoryCounts() {
  const res = await axiosInstance.post("/categories/update-counts");
  return res.data;
}
