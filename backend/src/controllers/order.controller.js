import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { OrderService } from "../services/order.service.js";
import { Idempotency } from "../models/idempotency.model.js";

export const myOrders = asyncHandler(async (req, res) => {
  const { items, meta } = await OrderService.listForUser(
    req.user._id,
    req.query
  );
  return ok(res, items, meta);
});

export const createOrder = asyncHandler(async (req, res) => {
  const {
    useCart = true,
    items: itemsInput,
    shippingAddress,
    note,
    paymentMethod,
  } = req.body;
  const key = req.headers["idempotency-key"];

  if (key) {
    const existing = await Idempotency.findOne({ key, user: req.user._id });
    if (existing) {
      // trả lại đơn đã tạo
      const old = await Order.findById(existing.orderId);
      if (old) return created(res, old);
    }
  }

  const order = useCart
    ? await OrderService.createFromCart(req.user._id, {
        shippingAddress,
        note,
        paymentMethod,
      })
    : await OrderService.createFromItems(req.user._id, {
        itemsInput,
        shippingAddress,
        note,
        paymentMethod,
      });

  if (key) {
    await Idempotency.create({ key, user: req.user._id, orderId: order._id });
  }

  return created(res, order);
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await OrderService.getByIdForUser(req.params.id, req.user._id);
  return ok(res, order);
});

// Admin
export const listAllOrders = asyncHandler(async (req, res) => {
  const { items, meta } = await OrderService.listAll(req.query);
  return ok(res, items, meta);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await OrderService.updateStatusAdmin(req.params.id, req.body);
  return ok(res, order);
});
