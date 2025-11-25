// src/services/cart.service.js
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";

export class CartService {
  /**
   * Lấy hoặc tạo giỏ hàng
   */
  static async getOrCreate(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "title priceSale price images stock slug studentDiscountAmount  gifts",
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        itemsTotal: 0,
        shippingFee: 0,
        grandTotal: 0,
      });
    }

    // Tính lại total (phòng trường hợp giá đã thay đổi)
    this.recalculate(cart);
    await cart.save();

    return this.formatCart(cart);
  }

  /**
   * Thêm sản phẩm vào giỏ
   */
  static async addItem(userId, { productId, qty, options }) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    if (product.stock < qty) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Not enough stock");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Tăng số lượng
      cart.items[existingItemIndex].qty += qty;
    } else {
      // Thêm mới
      cart.items.push({
        product: productId,
        title: product.title,
        price: product.priceSale || product.price,
        image: product.images?.[0] || "",
        qty,
        options: options || {},
      });
    }

    this.recalculate(cart);
    await cart.save();

    // Populate lại để trả về đầy đủ
    await cart.populate({
      path: "items.product",
      select:
        "title priceSale price images stock slug studentDiscountAmount gifts",
    });

    return this.formatCart(cart);
  }

  /**
   * Cập nhật số lượng
   */
  static async updateItem(userId, itemId, { qty, options }) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, "Item not found in cart");
    }

    // Kiểm tra stock
    const product = await Product.findById(item.product);
    if (product && qty > product.stock) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Not enough stock");
    }

    if (qty !== undefined) item.qty = Math.max(1, qty);
    if (options !== undefined) item.options = options;

    this.recalculate(cart);
    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "title priceSale price images stock slug studentDiscountAmount gifts",
    });

    return this.formatCart(cart);
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   */
  static async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    this.recalculate(cart);
    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "title priceSale price images stock slug studentDiscountAmount gifts",
    });

    return this.formatCart(cart);
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  static async clear(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.itemsTotal = 0;
      cart.grandTotal = 0;
      await cart.save();
    }
    return { message: "Cart cleared" };
  }

  /**
   * Tính lại tổng tiền
   */
  static recalculate(cart) {
    cart.itemsTotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    // TODO: Tính phí ship (có thể dựa vào địa chỉ)
    cart.shippingFee = cart.itemsTotal > 500000 ? 0 : 50000; // Free ship > 500k

    cart.grandTotal = cart.itemsTotal + cart.shippingFee;
  }

  /**
   * Format response
   */
  static formatCart(cart) {
    return {
      items: cart.items.map((item) => ({
        id: item._id.toString(),
        productId: item.product._id?.toString() || item.product.toString(),
        title: item.product.title || item.title,
        price: item.price,
        image: item.product.images?.[0] || item.image,
        qty: item.qty,
        stock: item.product.stock,
        slug: item.product.slug,
        subtotal: item.price * item.qty,
        studentDiscountAmount: Number(item.product.studentDiscountAmount || 0),
        gifts: Array.isArray(item.product.gifts) ? item.product.gifts : [],
      })),
      itemsTotal: cart.itemsTotal,
      shippingFee: cart.shippingFee,
      grandTotal: cart.grandTotal,
      itemCount: cart.items.length,
    };
  }
}
