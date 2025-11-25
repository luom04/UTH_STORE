// src/controllers/cart.controller.js
import { CartService } from "../services/cart.service.js";

export async function getMyCart(req, res, next) {
  try {
    const userId = req.user._id;
    const cart = await CartService.getOrCreate(userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function addItem(req, res, next) {
  try {
    const userId = req.user._id;
    const { productId, qty, options } = req.body;

    const cart = await CartService.addItem(userId, {
      productId,
      qty: qty || 1,
      options,
    });

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function putItem(req, res, next) {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { qty, options } = req.body;

    const cart = await CartService.updateItem(userId, itemId, { qty, options });
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req, res, next) {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await CartService.removeItem(userId, itemId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    const userId = req.user._id;
    await CartService.clear(userId);
    res.json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
}
