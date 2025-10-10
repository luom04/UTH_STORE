import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { CartService } from "../services/cart.service.js";

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await CartService.getOrCreate(req.user._id);
  return ok(res, cart);
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await CartService.addItem(req.user._id, req.body);
  return created(res, cart);
});

export const putItem = asyncHandler(async (req, res) => {
  const cart = await CartService.putItem(
    req.user._id,
    req.params.itemId,
    req.body
  );
  return ok(res, cart);
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await CartService.removeItem(req.user._id, req.params.itemId);
  return ok(res, cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await CartService.clear(req.user._id);
  return ok(res, cart);
});
