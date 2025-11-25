// backend/src/services/export.service.js
import { buildWorkbook } from "../utils/excel.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Brand } from "../models/brand.model.js";
import { Order } from "../models/order.model.js";

export class ExportService {
  /* ==========================================================================
     1. BÁO CÁO TỒN KHO (Sản phẩm)
     ========================================================================== */
  static async generateProductReport() {
    // 1. Lấy dữ liệu song song
    const [products, categories] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).lean(),
      Category.find().lean(),
    ]);

    // 2. Map danh mục thủ công (Fix lỗi schema String)
    const categoryMap = {};
    categories.forEach((cat) => {
      if (cat._id) categoryMap[cat._id.toString()] = cat.name;
      if (cat.slug) categoryMap[cat.slug] = cat.name;
    });

    const columns = [
      { header: "Mã sản phẩm (SKU)", key: "_id", width: 25 },
      { header: "Tên sản phẩm", key: "title", width: 40 },
      { header: "Danh mục", key: "category", width: 25 },
      { header: "Giá bán (VNĐ)", key: "price", width: 15 },
      { header: "Giá khuyến mãi", key: "priceSale", width: 15 },
      { header: "Số lượng tồn", key: "stock", width: 15 },
      { header: "Trạng thái tồn", key: "stockStatus", width: 20 },
      { header: "Giá trị tồn kho (VNĐ)", key: "inventoryValue", width: 20 },
      { header: "Trạng thái bán", key: "status", width: 15 },
      { header: "Ngày tạo", key: "createdAt", width: 20 },
    ];

    const rows = products.map((d) => {
      const stock = Number(d.stock) || 0;
      const price = Number(d.price) || 0;

      let stockStatus = "Bình thường";
      if (stock === 0) stockStatus = "HẾT HÀNG";
      else if (stock <= 5) stockStatus = "SẮP HẾT";

      let categoryName = "Chưa phân loại";
      if (d.category) {
        const key = d.category.toString();
        if (categoryMap[key]) categoryName = categoryMap[key];
        else if (d.category._id && categoryMap[d.category._id.toString()]) {
          categoryName = categoryMap[d.category._id.toString()];
        }
      }

      return {
        _id: d._id.toString(),
        title: d.title,
        category: categoryName,
        price: price,
        priceSale: d.priceSale || 0,
        stock: stock,
        stockStatus: stockStatus,
        inventoryValue: stock * price,
        status: d.status === "active" ? "Đang bán" : "Ngừng bán",
        createdAt: new Date(d.createdAt).toLocaleDateString("vi-VN"),
      };
    });

    // Tạo và trả về workbook (Logic ExcelJS vẫn nằm trong utils)
    const wb = await buildWorkbook({
      sheetName: "Báo cáo Tồn kho",
      columns,
      rows,
    });

    // Format Header
    const sheet = wb.worksheets[0];
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };

    return wb;
  }

  /* ==========================================================================
     2. BÁO CÁO ĐƠN HÀNG (Logistics)
     ========================================================================== */
  static async generateOrderReport({ from, to, status }) {
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const docs = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      { header: "Mã đơn hàng", key: "orderNumber", width: 20 },
      { header: "Ngày đặt", key: "createdAt", width: 20 },
      { header: "Tên khách hàng", key: "customerName", width: 25 },
      { header: "SĐT Liên hệ", key: "phone", width: 15 },
      { header: "Địa chỉ giao hàng", key: "address", width: 40 },
      { header: "Tổng tiền hàng", key: "itemsTotal", width: 15 },
      { header: "Phí Ship", key: "shippingFee", width: 15 },
      { header: "Tổng thanh toán", key: "grandTotal", width: 20 },
      { header: "Phương thức TT", key: "paymentMethod", width: 15 },
      { header: "Trạng thái TT", key: "paymentStatus", width: 15 },
      { header: "Trạng thái Đơn", key: "status", width: 20 },
      { header: "Ghi chú", key: "note", width: 25 },
    ];

    const statusMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao hàng",
      completed: "Hoàn thành",
      canceled: "Đã hủy",
    };
    const paymentStatusMap = {
      unpaid: "Chưa thanh toán",
      pending: "Chờ xử lý (COD)",
      paid: "Đã thanh toán",
    };

    const rows = docs.map((d) => {
      const addr = d.shippingAddress || {};
      const fullAddress = [addr.line1, addr.ward, addr.district, addr.city]
        .filter(Boolean)
        .join(", ");

      return {
        orderNumber: d.orderNumber || d._id.toString(),
        createdAt: new Date(d.createdAt).toLocaleString("vi-VN"),
        customerName: addr.fullName || d.user?.name || "Khách lẻ",
        phone: addr.phone || "",
        address: fullAddress,
        itemsTotal: d.itemsTotal,
        shippingFee: d.shippingFee,
        grandTotal: d.grandTotal,
        paymentMethod: d.paymentMethod ? d.paymentMethod.toUpperCase() : "COD",
        paymentStatus: paymentStatusMap[d.paymentStatus] || d.paymentStatus,
        status: statusMap[d.status] || d.status,
        note: d.note || "",
      };
    });

    const wb = await buildWorkbook({
      sheetName: "Danh sách Đơn hàng",
      columns,
      rows,
    });

    const sheet = wb.worksheets[0];
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };

    return wb;
  }

  /* ==========================================================================
     3. DANH MỤC
     ========================================================================== */
  static async generateCategoryReport() {
    const docs = await Category.find().lean();
    const columns = [
      { header: "Tên danh mục", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 30 },
      { header: "Trạng thái", key: "status", width: 15 },
      { header: "Thứ tự", key: "order", width: 15 },
    ];
    const rows = docs.map((d) => ({
      name: d.name,
      slug: d.slug,
      status: d.status === "active" ? "Hiển thị" : "Ẩn",
      order: d.order ?? 0,
    }));
    return buildWorkbook({ sheetName: "Danh mục", columns, rows });
  }

  /* ==========================================================================
     4. THƯƠNG HIỆU
     ========================================================================== */
  static async generateBrandReport() {
    const docs = await Brand.find().lean();
    const columns = [
      { header: "Tên thương hiệu", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 30 },
      { header: "Trạng thái", key: "status", width: 15 },
    ];
    const rows = docs.map((d) => ({
      name: d.name,
      slug: d.slug,
      status: d.status === "active" ? "Hiển thị" : "Ẩn",
    }));
    return buildWorkbook({ sheetName: "Thương hiệu", columns, rows });
  }
}
