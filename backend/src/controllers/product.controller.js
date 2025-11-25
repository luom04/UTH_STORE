// src/controllers/product.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ProductService } from "../services/product.service.js";
import { ok, created } from "../utils/apiResponse.js";
import { toSlug } from "../utils/slugify.js";

export const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.slug && data.title) data.slug = toSlug(data.title);
  const doc = await ProductService.create(data);
  return created(res, doc);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await ProductService.list(req.query);
  return ok(res, items, meta);
});

// export const getProduct = asyncHandler(async (req, res) => {
//   const doc = await ProductService.getById(req.params.id);
//   return ok(res, doc);
// });
// 🆕 FIX: getProduct - Sử dụng service method mới
// ✅ SAU (dùng asyncHandler như các function khác):
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("🔍 [Controller] getProduct called with param:", id);

  const doc = await ProductService.getByIdOrSlug(id);

  console.log("✅ [Controller] Product found:", doc.title);
  return ok(res, doc);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.title && !data.slug) data.slug = toSlug(data.title);
  const doc = await ProductService.update(req.params.id, data);
  return ok(res, doc);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await ProductService.remove(req.params.id);
  return ok(res, result);
});

// + cuối file
export const updateProductStock = asyncHandler(async (req, res) => {
  const { diff } = req.body; // số dương/âm
  const doc = await ProductService.updateStock(
    req.params.id,
    Number(diff) || 0
  );
  return ok(res, doc);
});

// ✅ NEW: suggest/search cho dropdown
export const suggestProducts = asyncHandler(async (req, res) => {
  const { q = "", limit, fields } = req.query;
  // nếu q rỗng, trả mảng rỗng để dropdown không spam DB
  if (!q.trim()) return ok(res, []);

  const items = await ProductService.searchSuggest(q, limit, fields);
  return ok(res, items);
});
