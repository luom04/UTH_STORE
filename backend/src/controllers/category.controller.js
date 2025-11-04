// src/controllers/category.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { CategoryService } from "../services/category.service.js";
import { ok, created } from "../utils/apiResponse.js";
import { toSlug } from "../utils/slugify.js";

export const createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.slug && data.name) {
    data.slug = toSlug(data.name);
  }
  const category = await CategoryService.create(data);
  return created(res, category);
});

export const listCategories = asyncHandler(async (req, res) => {
  const { items, meta } = await CategoryService.list(req.query);
  return ok(res, items, meta);
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await CategoryService.getById(req.params.id);
  return ok(res, category);
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await CategoryService.getBySlug(req.params.slug);
  return ok(res, category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.name && !data.slug) {
    data.slug = toSlug(data.name);
  }
  const category = await CategoryService.update(req.params.id, data);
  return ok(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await CategoryService.remove(req.params.id);
  return ok(res, result);
});

export const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await CategoryService.getTree();
  return ok(res, tree);
});

export const updateProductCounts = asyncHandler(async (req, res) => {
  const result = await CategoryService.updateAllProductCounts();
  return ok(res, result);
});
