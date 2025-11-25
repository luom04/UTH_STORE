// src/controllers/order.controller.js
import { OrderService } from "../services/order.service.js";

/**
 * Tạo đơn hàng mới
 * POST /api/orders
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user._id;
    const orderData = req.body;

    const order = await OrderService.createOrder(userId, orderData);

    res.status(201).json({
      success: true,
      data: order,
      message: "Đặt hàng thành công!",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy danh sách đơn hàng của user
 * GET /api/orders
 */
export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const result = await OrderService.getOrdersByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.json({
      success: true,
      data: result.orders,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await OrderService.getOrderById(id, userId);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Hủy đơn hàng
 * PUT /api/orders/:id/cancel
 */
export async function cancelOrder(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await OrderService.cancelOrder(id, userId, reason);

    res.json({
      success: true,
      data: order,
      message: "Đã hủy đơn hàng",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Lấy tất cả đơn hàng
 * GET /api/admin/orders
 */
export async function getAllOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search || "";
    const days = req.query.days; // ✅ THÊM

    const result = await OrderService.getAllOrders({
      page,
      limit,
      status,
      search,
      days, // ✅ TRUYỀN XUỐNG SERVICE
    });

    return res.json({
      success: true,
      data: result.orders,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Cập nhật trạng thái đơn hàng
 * PUT /api/admin/orders/:id/status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await OrderService.updateOrderStatus(id, status, note);

    res.json({
      success: true,
      data: order,
      message: "Đã cập nhật trạng thái đơn hàng",
    });
  } catch (error) {
    next(error);
  }
}

// src/controllers/order.controller.js
export async function getAdminOrderStats(req, res, next) {
  try {
    const range = Number(req.query.range) || 7; // 7 / 14 / 30

    // ✅ GỌI ĐÚNG TÊN HÀM ĐANG CÓ TRONG SERVICE
    const data = await OrderService.getAdminOrderStats(range);

    return res.json({
      success: true,
      data, // { buckets, summary }
    });
  } catch (error) {
    next(error);
  }
}
