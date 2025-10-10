import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { BrandService } from "../services/brand.service.js";

export const createBrand = asyncHandler(async (req, res) => {
  const doc = await BrandService.create(req.body);
  return created(res, doc);
});
export const listBrands = asyncHandler(async (req, res) => {
  const { items, meta } = await BrandService.list(req.query);
  return ok(res, items, meta);
});
export const getBrand = asyncHandler(async (req, res) => {
  const doc = await BrandService.getById(req.params.id);
  return ok(res, doc);
});
export const updateBrand = asyncHandler(async (req, res) => {
  const doc = await BrandService.update(req.params.id, req.body);
  return ok(res, doc);
});
export const deleteBrand = asyncHandler(async (req, res) => {
  const result = await BrandService.remove(req.params.id);
  return ok(res, result);
});
