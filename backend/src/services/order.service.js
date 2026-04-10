//src/services/order.service.js
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { CouponService } from "../services/coupon.service.js";
import { Coupon } from "../models/coupon.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";
import {
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
} from "../utils/sendEmail.js";

export class OrderService {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   */

  //src/services/order.service.js
  static async createOrder(userId, orderData) {
    const {
      shippingAddress,
      paymentMethod: rawPaymentMethod = "COD",
      note = "",
      couponCode,
    } = orderData;

    const paymentMethod = rawPaymentMethod.toLowerCase();

    console.log("=== [createOrder] ===");
    console.log("userId:", userId);
    console.log("paymentMethod:", paymentMethod);

    const cart = await Cart.findOne({ user: userId }).populate([
      {
        path: "items.product",
        select:
          "title price priceSale stock images slug studentDiscountAmount gifts giftProducts",
      },
      { path: "user", select: "name email phone" },
    ]);

    console.log(
      "Cart found?",
      !!cart,
      "items length:",
      cart?.items?.length || 0
    );

    if (!cart || !cart.items.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Giỏ hàng trống");
    }
    const user = cart.user;

    // ✅ Check user có phải sinh viên không
    const userDoc = await User.findById(userId).select("isStudent");
    const isStudent = !!userDoc?.isStudent;

    // 2. Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullname ||
      !shippingAddress.phone ||
      !shippingAddress.address
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Thông tin giao hàng không đầy đủ"
      );
    }

    const finalShippingAddress = {
      fullName: shippingAddress.fullname,
      phone: shippingAddress.phone,
      line1: shippingAddress.address,
      line2: shippingAddress.line2,
      district: shippingAddress.district?.name,
      city: shippingAddress.province?.name,
      ward: shippingAddress.ward?.name,
    };

    const orderItems = [];

    // Tổng tiền hàng TRƯỚC HSSV (hiển thị "Tổng tiền hàng")
    let itemsTotalOriginal = 0;

    // Tổng tiền SAU HSSV (tính ship/coupon/grandTotal)
    let itemsTotalAfterStudent = 0;

    // Tổng giảm HSSV toàn đơn
    let studentDiscountTotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Sản phẩm không tồn tại");
      }

      if (product.stock < cartItem.qty) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Sản phẩm "${product.title}" hết hàng`
        );
      }

      // Giá gốc trước HSSV (đã tính sale thường)
      const basePriceBeforeStudent = product.priceSale || product.price;

      // ✅ Cộng vào tổng tiền hàng gốc
      itemsTotalOriginal += basePriceBeforeStudent * cartItem.qty;

      // Giá hiện tại sau HSSV (mặc định = basePrice)
      let currentPrice = basePriceBeforeStudent;
      let appliedPerUnitStudent = 0;
      let discountNote = "";

      // ✅ Logic giảm giá HSSV
      if (isStudent && product.studentDiscountAmount > 0) {
        const discountVal = product.studentDiscountAmount;

        appliedPerUnitStudent = Math.min(discountVal, basePriceBeforeStudent);

        if (appliedPerUnitStudent > 0) {
          currentPrice = basePriceBeforeStudent - appliedPerUnitStudent;
          discountNote = `(Đã giảm ${appliedPerUnitStudent.toLocaleString()}đ cho HSSV)`;

          studentDiscountTotal += appliedPerUnitStudent * cartItem.qty;
        }
      }

      const subtotal = currentPrice * cartItem.qty;

      // ✅ Cộng vào tổng sau HSSV
      itemsTotalAfterStudent += subtotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: currentPrice, // giá sau HSSV
        originalPrice: basePriceBeforeStudent, // giá trước HSSV
        studentDiscountPerUnit: appliedPerUnitStudent,

        qty: cartItem.qty,
        image: product.images?.[0] || "",
        slug: product.slug,
        subtotal,
        options: discountNote ? { note: discountNote } : undefined,
      });
    }

    // ============================================================
    // ✅ [NEW] GOM QUÀ TẶNG THẬT (giftProducts) TỪ CART
    // - Không cộng vào total vì quà free
    // - Nhưng sẽ trừ stock quà khi tạo đơn
    // ============================================================
    const giftMap = new Map(); // giftProductId -> totalQty

    for (const cartItem of cart.items) {
      const p = cartItem.product;
      const gpList = Array.isArray(p?.giftProducts) ? p.giftProducts : [];

      for (const gp of gpList) {
        if (!gp?.product) continue;
        const gid = String(gp.product);
        const perUnit = Number(gp.qty || 1);
        const addQty = perUnit * Number(cartItem.qty || 0);

        giftMap.set(gid, (giftMap.get(gid) || 0) + addQty);
      }
    }

    const giftIds = [...giftMap.keys()];

    if (giftIds.length) {
      const giftDocs = await Product.find({ _id: { $in: giftIds } })
        .select("title stock images slug")
        .lean();

      const giftDocMap = new Map(giftDocs.map((d) => [String(d._id), d]));

      for (const gid of giftIds) {
        const giftProduct = giftDocMap.get(gid);
        const giftQty = giftMap.get(gid);

        if (!giftProduct) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Quà tặng không tồn tại trong kho"
          );
        }

        if (giftProduct.stock < giftQty) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Quà tặng "${giftProduct.title}" đã hết hàng`
          );
        }

        orderItems.push({
          product: giftProduct._id,
          title: giftProduct.title,
          price: 0,
          originalPrice: 0,
          studentDiscountPerUnit: 0,

          qty: giftQty,
          image: giftProduct.images?.[0] || "",
          slug: giftProduct.slug,
          subtotal: 0,

          isGift: true,
          options: { note: "Quà tặng kèm" },
        });
      }
    }

    // 4. Tính phí vận chuyển theo tổng SAU HSSV
    const shippingFee = itemsTotalAfterStudent >= 500000 ? 0 : 50000;

    // 5. Tính voucher theo tổng SAU HSSV
    let discountAmount = 0;
    let finalCouponCode = null;

    if (couponCode && couponCode.trim()) {
      finalCouponCode = couponCode.toUpperCase().trim();

      try {
        const couponRes = await CouponService.applyCoupon(
          userId,
          finalCouponCode,
          itemsTotalAfterStudent
        );
        discountAmount = couponRes.discountAmount;
      } catch (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Lỗi Voucher: ${error.message}`
        );
      }
    }

    // 6. Grand total = tổng sau HSSV + ship - voucher
    const grandTotal = Math.max(
      0,
      itemsTotalAfterStudent + shippingFee - discountAmount
    );

    // 7. Tạo mã đơn hàng
    const orderNumber = await this.generateOrderNumber();

    // 8. Tạo đơn hàng
    const order = await Order.create({
      orderNumber,
      user: userId,
      items: orderItems,

      // ✅ LƯU TỔNG GỐC để FE hiển thị đúng
      itemsTotal: itemsTotalOriginal,

      shippingFee,
      couponCode: finalCouponCode,
      discountAmount,
      grandTotal,

      shippingAddress: finalShippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "unpaid",
      status: "pending",
      note,

      // ✅ tổng giảm HSSV
      studentDiscountAmount: Number(studentDiscountTotal) || 0,
    });

    // 9. Update coupon usage
    if (finalCouponCode && discountAmount > 0) {
      await Coupon.updateOne(
        { code: finalCouponCode },
        {
          $inc: { usedCount: 1 },
          $push: { usedBy: userId },
        }
      );
    }

    // ============================================================
    // 10. ✅ Trừ tồn kho (gộp theo productId, gồm cả quà tặng)
    // ============================================================
    const decMap = new Map();
    for (const it of orderItems) {
      const pid = String(it.product);
      decMap.set(pid, (decMap.get(pid) || 0) + Number(it.qty || 0));
    }

    for (const [pid, qty] of decMap) {
      await Product.findByIdAndUpdate(pid, {
        $inc: { stock: -qty },
      });
    }

    //  Gửi email
    if (user && user.email) {
      try {
        // ✅ CHỈ GỬI MAIL NGAY CHO COD
        if (paymentMethod === "cod") {
          await sendOrderConfirmationEmail(
            {
              orderNumber: order.orderNumber,
              grandTotal: order.grandTotal,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
              items: order.items,
              itemsTotal: order.itemsTotal, // sau HSSV
              shippingFee: order.shippingFee,

              // ✅ thêm mới
              couponCode: order.couponCode,
              discountAmount: order.discountAmount,
              studentDiscountAmount: order.studentDiscountAmount,
            },
            { email: user.email, name: user.name }
          );
        }
      } catch (err) {
        console.error("Lỗi gửi mail:", err.message);
      }
    }

    // 12. Xóa giỏ hàng
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], itemsTotal: 0, shippingFee: 0, grandTotal: 0 }
    );

    await order.populate("user", "name email phone");
    return order;
  }

  /**
   * Generate mã đơn hàng unique
   */
  static async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequence = String(count + 1).padStart(4, "0");

    return `ORD${year}${month}${day}${sequence}`;
  }

  /**
   * Lấy danh sách đơn hàng của user
   */
  static async getOrdersByUser(userId, { page = 1, limit = 10, status }) {
    const skip = (page - 1) * limit;

    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  static async getOrderById(orderId, userId) {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("user", "name email phone");

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
    }

    return order;
  }

  /**
   * Hủy đơn hàng (phía customer)
   */
  static async cancelOrder(orderId, userId, reason = "") {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
    }

    // Chỉ cho phép hủy khi đơn còn ở trạng thái pending
    if (order.status !== "pending") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Không thể hủy đơn hàng đã được xử lý"
      );
    }

    // Trả hàng về kho
    const incMap = new Map();
    for (const it of order.items) {
      const pid = String(it.product);
      incMap.set(pid, (incMap.get(pid) || 0) + Number(it.qty || 0));
    }

    for (const [pid, qty] of incMap) {
      await Product.findByIdAndUpdate(pid, {
        $inc: { stock: qty },
      });
    }

    // 2. ✅ THÊM: Hoàn lại Coupon (nếu đơn đó có dùng coupon)
    if (order.couponCode) {
      console.log(`↩️ Reverting Coupon: ${order.couponCode}`);
      await Coupon.updateOne(
        { code: order.couponCode },
        {
          $inc: { usedCount: -1 }, // Giảm số lượng đã dùng (tức là trả lại 1 lượt)
          $pull: { usedBy: order.user }, // Xóa user khỏi danh sách đã dùng
        }
      );
    }

    const now = new Date();
    const finalReason =
      (reason && reason.trim()) || "Khách hàng đã yêu cầu hủy đơn hàng";

    // Ghi lịch sử trạng thái
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      from: order.status,
      to: "canceled",
      note: finalReason,
      by: String(userId),
      at: now,
    });

    // ✅ Cập nhật trạng thái + info hủy (1 lần duy nhất)
    order.status = "canceled";
    order.canceledAt = now;
    order.cancelReason = finalReason;
    order.canceledByType = "customer";

    await order.save({ validateModifiedOnly: true });

    return order;
  }

  /**
   * Admin: Lấy tất cả đơn hàng (có filter, search, pagination)
   */
  /**
   * Admin: Lấy tất cả đơn hàng (filter, search, pagination, days)
   */
  static async getAllOrders({
    page = 1,
    limit = 20,
    status,
    search,
    days = 7,
  }) {
    const skip = (page - 1) * limit;

    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Lọc theo khoảng ngày chỉ nhận 7/14/30
    const d = Number(days);
    const safeDays = [7, 14, 30].includes(d) ? d : 7;

    if (safeDays > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const from = new Date(today);
      from.setDate(from.getDate() - (safeDays - 1));

      const to = new Date(today);
      to.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: from, $lte: to };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        // ✅ optional: giảm payload nhưng vẫn đủ data FE cần
        .select(
          "orderNumber user shippingAddress items itemsTotal shippingFee couponCode discountAmount grandTotal paymentMethod paymentStatus status createdAt canceledAt cancelReason canceledByType studentDiscountAmount note"
        )
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ✅ src/services/order.service.js
  static async updateOrderStatus(orderId, newStatus, note = "") {
    // populate user để có email, name (phục vụ gửi mail)
    const order = await Order.findById(orderId).populate(
      "user",
      "name email phone"
    );

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
    }

    const oldStatus = order.status;

    // 2) Các transition bình thường
    const validTransitions = {
      pending: ["confirmed", "canceled"],
      confirmed: ["shipping", "canceled"],
      shipping: ["completed", "canceled"],
      completed: [],
      canceled: [],
    };

    const current = order.status;

    // ⭐Cho phép cập nhật lại lý do khi đơn đã bị hủy
    if (current === "canceled" && newStatus === "canceled") {
      const now = new Date();
      const finalReason =
        (note && note.trim()) ||
        order.cancelReason ||
        "Đơn hàng đã được shop hủy";

      order.cancelReason = finalReason;

      // (Optional) lưu lịch sử chỉnh sửa lý do
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        from: "canceled",
        to: "canceled",
        note: finalReason,
        by: "admin", // sau này nếu có adminId thì set theo
        at: now,
      });

      await order.save({ validateModifiedOnly: true });
      return order;
    }

    if (!validTransitions[current]?.includes(newStatus)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Không thể chuyển từ ${current} sang ${newStatus}`
      );
    }

    // ✅ Cập nhật status
    order.status = newStatus;

    if (newStatus === "confirmed") {
      order.confirmedAt = new Date();
    } else if (newStatus === "shipping") {
      order.shippingAt = new Date();
    } else if (newStatus === "completed") {
      order.completedAt = new Date();
      order.paymentStatus = "paid";

      // Logic tăng trường sold cho sản phẩm
      for (const item of order.items) {
        // Chỉ tăng sold cho sản phẩm chính, không tính quà tặng (nếu bạn muốn)
        if (!item.isGift) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { sold: item.qty },
          });
          console.log(
            `📈 Đã tăng sold cho sản phẩm: ${item.title} (+${item.qty})`
          );
        }
      }
    } else if (newStatus === "canceled") {
      const now = new Date();
      const finalReason = (note && note.trim()) || "Đơn hàng đã được shop hủy";

      order.canceledAt = now;
      order.cancelReason = finalReason;
      order.canceledByType = "admin";

      // Ghi lịch sử trạng thái
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        from: oldStatus,
        to: "canceled",
        note: finalReason,
        by: "admin",
        at: now,
      });

      // Hoàn stock khi hủy
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty },
        });
      }
    }

    await order.save({ validateModifiedOnly: true });

    // 📨 Gửi mail khi đơn chuyển sang completed (giữ nguyên logic cũ)
    if (oldStatus !== "completed" && newStatus === "completed") {
      const user = order.user;
      if (user && user.email) {
        try {
          await sendOrderDeliveredEmail(
            {
              orderNumber: order.orderNumber,
              items: order.items,
              itemsTotal: order.itemsTotal, // sau HSSV
              shippingFee: order.shippingFee,
              grandTotal: order.grandTotal,
              paymentMethod: order.paymentMethod,
              completedAt: order.completedAt,

              // ✅ thêm mới
              couponCode: order.couponCode,
              discountAmount: order.discountAmount,
              studentDiscountAmount: order.studentDiscountAmount,
            },
            { email: user.email, name: user.name }
          );

          console.log(
            `✅ [DEBUG] Đã gửi email 'đơn hàng đã giao' tới ${user.email}`
          );
        } catch (err) {
          console.error(
            "⚠️ [DEBUG] Gửi email 'đơn hàng đã giao' thất bại, nhưng không chặn flow:",
            err.message
          );
        }
      } else {
        console.warn(
          "⚠️ [DEBUG] Không gửi được email 'đơn hàng đã giao' vì thiếu email user."
        );
      }
    }

    return order;
  }

  /**
   * Admin: Thống kê đơn hàng theo khoảng thời gian (7 / 14 / 30 ngày)
   * Trả về:
   *  - buckets: [{ date: 'YYYY-MM-DD', totalOrders, revenue, completed, canceled, pending, shipping, confirmed }]
   *  - summary: { totalOrders, totalRevenue, completedRate, cancelRate, avgOrderValue, ... }
   */
  static async getAdminOrderStats(days = 7) {
    const d = Number(days);
    const safeDays = [7, 14, 30].includes(d) ? d : 7;

    // "Hôm nay" theo server, reset 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // from = hôm nay - (safeDays - 1)
    const from = new Date(today);
    from.setDate(from.getDate() - (safeDays - 1));

    // to = hết ngày hôm nay
    const to = new Date(today);
    to.setHours(23, 59, 59, 999);

    // Lấy đơn trong khoảng from → to
    const orders = await Order.find({
      createdAt: { $gte: from, $lte: to },
    }).lean();

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    // Khởi tạo map từng ngày
    const map = {};
    for (let i = 0; i < safeDays; i++) {
      const cur = new Date(from);
      cur.setDate(from.getDate() + i);

      const key = formatDate(cur);
      map[key] = {
        date: key,
        totalOrders: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        completed: 0,
        canceled: 0,
        revenue: 0,
      };
    }

    // Đổ dữ liệu vào từng bucket ngày
    for (const o of orders) {
      const key = formatDate(new Date(o.createdAt));
      const bucket = map[key];
      if (!bucket) continue; // ngoài range thì bỏ qua (phòng lệch TZ)

      bucket.totalOrders += 1;

      if (o.status && bucket[o.status] !== undefined) {
        bucket[o.status] += 1;
      }

      if (o.status === "completed") {
        bucket.revenue += Number(o.grandTotal || 0);
      }
    }

    const buckets = Object.values(map).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // ===== TÍNH SUMMARY =====
    let totalOrders = 0;
    let totalRevenue = 0;
    let completedCount = 0;
    let canceledCount = 0;

    for (const b of buckets) {
      totalOrders += b.totalOrders;
      totalRevenue += b.revenue;
      completedCount += b.completed;
      canceledCount += b.canceled;
    }

    const completedRate = totalOrders
      ? (completedCount * 100) / totalOrders
      : 0;
    const cancelRate = totalOrders ? (canceledCount * 100) / totalOrders : 0;
    const avgOrderValue = completedCount ? totalRevenue / completedCount : 0;

    return {
      buckets,
      summary: {
        days: safeDays,
        from,
        to,
        totalOrders,
        totalRevenue,
        completedCount,
        canceledCount,
        completedRate,
        cancelRate,
        avgOrderValue,
      },
    };
  }

  static async getStats(days = 7) {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - days);

    // Dùng Mongo Aggregate để tính toán
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: pastDate }, // Lọc theo ngày
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$grandTotal" },
          // Đếm trạng thái để Frontend vẽ biểu đồ
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          shipping: {
            $sum: { $cond: [{ $eq: ["$status", "shipping"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          canceled: {
            $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map dữ liệu cho đẹp
    const items = stats.map((s) => ({
      date: s._id,
      totalOrders: s.totalOrders,
      revenue: s.revenue,
      pending: s.pending,
      confirmed: s.confirmed,
      shipping: s.shipping,
      completed: s.completed,
      canceled: s.canceled,
    }));

    return { days, items };
  }
}
