import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { CategoryService } from "../services/category.service.js";

export const createCategory = asyncHandler(async (req, res) => {
  const doc = await CategoryService.create(req.body);
  return created(res, doc);
});
export const listCategories = asyncHandler(async (req, res) => {
  const { items, meta } = await CategoryService.list(req.query);
  return ok(res, items, meta);
});
export const getCategory = asyncHandler(async (req, res) => {
  const doc = await CategoryService.getById(req.params.id);
  return ok(res, doc);
});
export const updateCategory = asyncHandler(async (req, res) => {
  const doc = await CategoryService.update(req.params.id, req.body);
  return ok(res, doc);
});
export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await CategoryService.remove(req.params.id);
  return ok(res, result);
});
