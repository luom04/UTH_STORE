import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

function pickImage(images = []) {
  return images?.[0] || "";
}
function effPrice(p) {
  return typeof p.priceSale === "number" && p.priceSale >= 0
    ? p.priceSale
    : p.price;
}

function recompute(cart) {
  cart.itemsTotal = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
  cart.grandTotal = cart.itemsTotal + (cart.shippingFee || 0);
  return cart;
}

export const CartService = {
  async getOrCreate(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
  },

  async addItem(userId, { productId, qty = 1, options }) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    if (product.stock < qty)
      throw new ApiError(httpStatus.BAD_REQUEST, "Not enough stock");

    const cart = await this.getOrCreate(userId);

    // nếu item cùng product + options -> tăng qty
    const key = (o) => JSON.stringify(o || {});
    const idx = cart.items.findIndex(
      (it) =>
        String(it.product) === String(productId) &&
        key(it.options) === key(options)
    );

    if (idx >= 0) {
      const newQty = cart.items[idx].qty + qty;
      if (product.stock < newQty)
        throw new ApiError(httpStatus.BAD_REQUEST, "Exceeds stock");
      cart.items[idx].qty = newQty;
    } else {
      cart.items.push({
        product: product._id,
        title: product.title,
        price: effPrice(product),
        image: pickImage(product.images),
        qty,
        options,
      });
    }
    recompute(cart);
    await cart.save();
    return cart;
  },

  async putItem(userId, itemId, { qty, options }) {
    const cart = await this.getOrCreate(userId);
    const it = cart.items.id(itemId);
    if (!it) throw new ApiError(httpStatus.NOT_FOUND, "Item not found");

    const product = await Product.findById(it.product);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

    if (qty != null) {
      if (qty < 1) throw new ApiError(httpStatus.BAD_REQUEST, "qty >= 1");
      if (product.stock < qty)
        throw new ApiError(httpStatus.BAD_REQUEST, "Exceeds stock");
      it.qty = qty;
    }
    if (options) it.options = options;

    // cập nhật snapshot đề phòng giá thay đổi
    it.title = product.title;
    it.price = effPrice(product);
    it.image = pickImage(product.images);

    recompute(cart);
    await cart.save();
    return cart;
  },

  async removeItem(userId, itemId) {
    const cart = await this.getOrCreate(userId);
    const it = cart.items.id(itemId);
    if (!it) throw new ApiError(httpStatus.NOT_FOUND, "Item not found");
    it.deleteOne();
    recompute(cart);
    await cart.save();
    return cart;
  },

  async clear(userId) {
    const cart = await this.getOrCreate(userId);
    cart.items = [];
    recompute(cart);
    await cart.save();
    return cart;
  },
};
