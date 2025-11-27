// src/services/dashboard.service.js
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { DashboardNote } from "../models/dashboardNote.model.js";

export class DashboardService {
  static async getStats(userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalRevenue,
      revenueToday,
      totalOrders,
      ordersPending,
      lowStockProducts,
      totalCustomers,
      recentOrders,
      notes,
    ] = await Promise.all([
      // 1. Tổng doanh thu
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),

      // 2. Doanh thu hôm nay
      Order.aggregate([
        {
          $match: {
            status: "completed",
            updatedAt: { $gte: startOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),

      // 3. Tổng đơn hàng
      Order.countDocuments(),

      // 4. Đơn chờ xử lý
      Order.countDocuments({ status: "pending" }),

      // 5. Sản phẩm sắp hết hàng
      Product.countDocuments({ stock: { $lte: 5 } }),

      // 6. Tổng khách hàng
      User.countDocuments({ role: "customer" }),

      // 7. 5 đơn mới nhất
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("orderNumber grandTotal status createdAt user")
        .lean(),

      // 8. Ghi chú Dashboard dùng chung
      DashboardNote.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("author", "name role") // để hiển thị tên + role nếu muốn
        .lean(),
    ]);

    return {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: revenueToday[0]?.total || 0,
      },
      orders: {
        total: totalOrders,
        pending: ordersPending,
      },
      products: {
        lowStock: lowStockProducts,
      },
      customers: {
        total: totalCustomers,
      },
      recentOrders,
      notes, // ✅ thêm mảng notes dùng chung
    };
  }

  // API cho biểu đồ doanh thu (7 ngày gần nhất)
  static async getRevenueChart() {
    const days = 7;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const stats = await Order.aggregate([
      { $match: { status: "completed", updatedAt: { $gte: date } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          revenue: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return stats;
  }

  // ✅ THÊM / LƯU ghi chú mới
  static async saveNote(userId, content) {
    if (!content?.trim()) return null;
    const note = await DashboardNote.create({
      content,
      author: userId,
    });
    return note.populate("author", "name role");
  }

  // ✅ SỬA ghi chú (ai cũng sửa được)
  static async updateNote(userId, noteId, content) {
    if (!content?.trim()) return null;

    const note = await DashboardNote.findByIdAndUpdate(
      noteId,
      { content },
      { new: true }
    ).populate("author", "name role");

    return note;
  }

  // ✅ XÓA ghi chú (ai cũng xóa được)
  static async deleteNote(userId, noteId) {
    return await DashboardNote.findByIdAndDelete(noteId);
  }
}
