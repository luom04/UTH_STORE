import { CustomerService } from "../services/customer.service.js";
import { OrderService } from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, q, status } = req.query;
  console.log("DEBUG FILTER:", { status, type: typeof status });
  const result = await CustomerService.getAllCustomers({
    page,
    limit,
    q,
    status,
  });
  res.json({ success: true, data: result.customers, meta: result.meta });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await CustomerService.updateCustomer(id, req.body);
  res.json({ success: true, data: result, message: "Cập nhật thành công" });
});

export const toggleBlockCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { block } = req.body; // { block: true/false }
  await CustomerService.toggleBlockCustomer(id, block);
  res.json({
    success: true,
    message: block ? "Đã chặn khách hàng" : "Đã mở khóa khách hàng",
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await CustomerService.deleteCustomer(id);
  res.json({ success: true, message: "Đã xóa khách hàng thành công" });
});

export const getCustomerStats = asyncHandler(async (req, res) => {
  const stats = await CustomerService.getCustomerStats();
  res.json({ success: true, data: stats });
});

// Thêm hàm này để lấy lịch sử đơn hàng của 1 khách
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID khách hàng
  const { page, limit } = req.query;

  // Tận dụng hàm getOrdersByUser có sẵn bên OrderService
  const result = await OrderService.getOrdersByUser(id, {
    page,
    limit,
    // Admin xem được mọi trạng thái
  });

  res.json({ success: true, data: result.orders, meta: result.meta });
});

// ✅ [CRM] Lấy chi tiết khách hàng (Full Profile + Notes)
export const getCustomerDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await CustomerService.getCustomerDetails(id);
  res.json({ success: true, data: customer });
});

// ✅ [CRM] Thêm ghi chú
export const addCustomerNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const authorId = req.user._id; // Lấy ID người đang đăng nhập (Admin/Staff)

  const notes = await CustomerService.addNote(id, { content, authorId });
  res.json({ success: true, data: notes, message: "Đã thêm ghi chú" });
});
