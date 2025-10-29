import { asyncHandler } from "../utils/asyncHandler.js";
import { AddressService } from "../services/address.service.js";
import { ok } from "../utils/apiResponse.js";

export const getAddresses = asyncHandler(async (req, res) => {
  const data = await AddressService.getAll(req.user._id);
  return ok(res, data);
});

export const addAddress = asyncHandler(async (req, res) => {
  const data = await AddressService.add(req.user._id, req.body);
  return ok(res, data);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const data = await AddressService.update(
    req.user._id,
    req.params.id,
    req.body
  );
  return ok(res, data);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const data = await AddressService.remove(req.user._id, req.params.id);
  return ok(res, data);
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const data = await AddressService.setDefault(req.user._id, req.params.id);
  return ok(res, data);
});
