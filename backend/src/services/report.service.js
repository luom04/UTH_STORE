// src/services/report.service.js
import { Product } from "../models/product.model.js";

export class ReportService {
  static async getInventoryReport() {
    // 1. Đếm tổng số sản phẩm và tổng stock
    // Dùng aggregate để DB tự tính tổng, không load docs về server
    const [stats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          // Đếm số sp hết hàng (stock = 0)
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
          // Đếm số sp sắp hết hàng (0 < stock <= 5)
          lowStockCount: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // 2. Lấy danh sách top 5 sản phẩm sắp hết hàng (stock <= 5 và stock > 0)
    // Chỉ lấy field cần thiết (title, stock)
    const lowStockTop = await Product.find({
      stock: { $lte: 5, $gt: 0 },
    })
      .select("title stock") // quan trọng: chỉ select field cần dùng
      .sort({ stock: 1 }) // tăng dần (ít hàng nhất lên đầu)
      .limit(5)
      .lean();

    return {
      totalProducts: stats?.totalProducts || 0,
      totalStock: stats?.totalStock || 0,
      lowStockCount: stats?.lowStockCount || 0,
      outOfStockCount: stats?.outOfStockCount || 0,
      lowStockTop,
    };
  }
}
