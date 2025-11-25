import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js"; // Nếu có model Review

export class DashboardService {
  static async getStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Chạy song song các truy vấn để tối ưu tốc độ
    const [
      totalRevenue,
      revenueToday,
      totalOrders,
      ordersPending,
      lowStockProducts,
      totalCustomers,
      recentOrders,
      recentReviews,
    ] = await Promise.all([
      // 1. Tổng doanh thu (Chỉ tính đơn hoàn thành)
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),

      // 2. Doanh thu hôm nay
      Order.aggregate([
        { $match: { status: "completed", updatedAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),

      // 3. Tổng đơn hàng
      Order.countDocuments(),

      // 4. Đơn chờ xử lý (Cần admin action)
      Order.countDocuments({ status: "pending" }),

      // 5. Sản phẩm sắp hết hàng (<= 5)
      Product.countDocuments({ stock: { $lte: 5 } }),

      // 6. Tổng khách hàng
      User.countDocuments({ role: "customer" }),

      // 7. 5 Đơn hàng mới nhất
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("orderNumber grandTotal status createdAt user")
        .lean(),

      // 8. (Optional) Review mới nhất - Nếu bạn có model Review
      // Review.find().sort({ createdAt: -1 }).limit(5).populate("user", "name").lean()
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
      // recentReviews
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
}
