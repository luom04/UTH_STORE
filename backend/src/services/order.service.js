import mongoose from "mongoose";
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Counter } from "../models/counter.model.js";
import { genOrderNumber } from "../utils/orderNumber.js";

function effPrice(p) {
  return typeof p.priceSale === "number" && p.priceSale >= 0
    ? p.priceSale
    : p.price;
}

async function nextSeq(session) {
  const doc = await Counter.findOneAndUpdate(
    { key: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  return doc.seq;
}

async function reserveStock(items, session) {
  // giảm stock theo từng sản phẩm
  for (const it of items) {
    const res = await Product.updateOne(
      { _id: it.product, stock: { $gte: it.qty } },
      { $inc: { stock: -it.qty } },
      { session }
    );
    if (res.modifiedCount !== 1) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Not enough stock for ${it.title}`
      );
    }
  }
}

async function releaseStock(items, session) {
  for (const it of items) {
    await Product.updateOne(
      { _id: it.product },
      { $inc: { stock: it.qty } },
      { session }
    );
  }
}

export const OrderService = {
  async listForUser(userId, { page = 1, limit = 20 }) {
    page = Number(page) || 1;
    limit = Math.min(Number(limit) || 20, 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Order.find({ user: userId }).sort("-createdAt").skip(skip).limit(limit),
      Order.countDocuments({ user: userId }),
    ]);
    return { items, meta: { page, limit, total } };
  },

  async listAll({ page = 1, limit = 20, status, paymentStatus }) {
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    page = Number(page) || 1;
    limit = Math.min(Number(limit) || 20, 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Order.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, meta: { page, limit, total } };
  },

  async createFromCart(
    userId,
    { shippingAddress, note, paymentMethod = "cod" }
  ) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0)
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // xác thực từ DB + build items snapshot
      let itemsTotal = 0;
      const items = [];
      for (const it of cart.items) {
        const p = await Product.findById(it.product).session(session);
        if (!p)
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product in cart");
        const price = effPrice(p);
        items.push({
          product: p._id,
          title: p.title,
          price,
          image: it.image,
          qty: it.qty,
          options: it.options,
        });
        itemsTotal += price * it.qty;
      }

      const shippingFee = cart.shippingFee || 0;
      const discount = 0;
      const grandTotal = itemsTotal + shippingFee - discount;

      // reserve stock
      await reserveStock(items, session);

      // sinh orderNumber
      const seq = await nextSeq(session);
      const orderNumber = genOrderNumber(seq);

      // set expiresAt (ví dụ 30 phút cho online, 48h cho COD — tuỳ chính sách)
      const expiresAt =
        paymentMethod === "online"
          ? new Date(Date.now() + 30 * 60 * 1000)
          : new Date(Date.now() + 48 * 60 * 60 * 1000);

      const order = await Order.create(
        [
          {
            orderNumber,
            user: userId,
            items,
            itemsTotal,
            shippingFee,
            discount,
            grandTotal,
            shippingAddress,
            note,
            paymentMethod,
            paymentStatus: "unpaid",
            status: "pending",
            statusHistory: [
              {
                from: null,
                to: "pending",
                by: String(userId),
                note: "Created",
              },
            ],
            expiresAt,
          },
        ],
        { session }
      );

      // clear cart
      cart.items = [];
      cart.itemsTotal = 0;
      cart.grandTotal = shippingFee;
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();
      return order[0];
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  },

  async createFromItems(
    userId,
    { itemsInput, shippingAddress, note, paymentMethod = "cod" }
  ) {
    if (!Array.isArray(itemsInput) || itemsInput.length === 0)
      throw new ApiError(httpStatus.BAD_REQUEST, "items required");

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let itemsTotal = 0;
      const items = [];
      for (const it of itemsInput) {
        const p = await Product.findById(it.productId).session(session);
        if (!p) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
        const price = effPrice(p);
        items.push({
          product: p._id,
          title: p.title,
          price,
          image: p.images?.[0] || "",
          qty: it.qty,
          options: it.options,
        });
        itemsTotal += price * it.qty;
      }

      // reserve
      await reserveStock(items, session);

      const shippingFee = 0;
      const discount = 0;
      const grandTotal = itemsTotal + shippingFee - discount;

      const seq = await nextSeq(session);
      const orderNumber = genOrderNumber(seq);
      const expiresAt =
        paymentMethod === "online"
          ? new Date(Date.now() + 30 * 60 * 1000)
          : new Date(Date.now() + 48 * 60 * 60 * 1000);

      const order = await Order.create(
        [
          {
            orderNumber,
            user: userId,
            items,
            itemsTotal,
            shippingFee,
            discount,
            grandTotal,
            shippingAddress,
            note,
            paymentMethod,
            paymentStatus: "unpaid",
            status: "pending",
            statusHistory: [
              {
                from: null,
                to: "pending",
                by: String(userId),
                note: "Created",
              },
            ],
            expiresAt,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return order[0];
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  },

  async getByIdForUser(id, userId) {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    if (String(order.user) !== String(userId))
      throw new ApiError(httpStatus.FORBIDDEN, "No access");
    return order;
  },

  async updateStatusAdmin(id, { status, paymentStatus }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findById(id).session(session);
      if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");

      const prevStatus = order.status;
      const prevPayment = order.paymentStatus;

      if (status && status !== order.status) {
        order.status = status;
        order.statusHistory.push({ from: prevStatus, to: status, by: "admin" });
      }
      if (paymentStatus && paymentStatus !== order.paymentStatus) {
        order.paymentStatus = paymentStatus;
        order.statusHistory.push({
          from: prevPayment,
          to: paymentStatus,
          by: "admin",
          note: "payment status",
        });
      }

      // Nếu chuyển "paid" → cộng sold (stock đã trừ khi tạo)
      if (paymentStatus === "paid") {
        for (const it of order.items) {
          await Product.updateOne(
            { _id: it.product },
            { $inc: { sold: it.qty } },
            { session }
          );
        }
      }

      // Nếu "canceled" hoặc "expired" mà chưa paid → trả stock
      const shouldRelease =
        (order.status === "canceled" || order.status === "expired") &&
        order.paymentStatus !== "paid";
      if (shouldRelease) {
        await releaseStock(order.items, session);
      }

      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return order;
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  },
};
