// backend/src/services/review.service.js
import httpStatus from "http-status";
import { Review } from "../models/review.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";

export class ReviewService {
  /**
   * Lấy review của 1 user cho 1 product trong 1 order
   */
  static async getMyReview(userId, { orderId, productId }) {
    if (!orderId || !productId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Thiếu orderId hoặc productId"
      );
    }

    const review = await Review.findOne({
      user: userId,
      order: orderId,
      product: productId,
    }).lean();

    return review;
  }

  /**
   * Tạo / cập nhật (upsert) review
   * - Chỉ cho phép nếu đơn thuộc về user
   * - Đơn phải có status = 'completed'
   * - Sản phẩm phải nằm trong items của đơn
   */
  static async upsertMyReview(userId, payload) {
    const { orderId, productId, rating, title, content, images } = payload;

    if (!orderId || !productId || typeof rating === "undefined") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Thiếu orderId, productId hoặc rating"
      );
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Rating phải từ 1 đến 5");
    }

    // 1. Kiểm tra đơn hàng thuộc về user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).lean();

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
    }

    // 2. Đơn chưa hoàn thành thì không cho đánh giá
    if (order.status !== "completed") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Chỉ được đánh giá khi đơn hàng đã hoàn thành"
      );
    }

    // 3. Check product có trong items không
    const hasProduct = Array.isArray(order.items)
      ? order.items.some((it) => String(it.product) === String(productId))
      : false;

    if (!hasProduct) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Sản phẩm không thuộc đơn hàng này"
      );
    }

    const imagesClean = Array.isArray(images)
      ? images
          .map((url) => String(url || "").trim())
          .filter((url) => url.length > 0)
      : [];

    const update = {
      user: userId,
      product: productId,
      order: orderId,
      rating: numericRating,
      title: title?.trim() || "",
      content: content?.trim() || "",
      images: imagesClean,
      isVerifiedPurchase: true,
    };

    // Upsert: nếu có thì update, chưa có thì tạo mới
    const review = await Review.findOneAndUpdate(
      { user: userId, product: productId, order: orderId },
      update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // ✅ SAU KHI LƯU REVIEW -> CẬP NHẬT LẠI RATING & SỐ LƯỢT ĐÁNH GIÁ CHO PRODUCT
    await ReviewService.updateProductRating(productId);

    return review;
  }

  /**
   * Lấy danh sách review theo product
   * (dùng cho trang chi tiết sản phẩm)
   */
  static async getProductReviews(productId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const filter = {
      product: productId,
      isVisible: true, // 👈 QUAN TRỌNG: Chỉ hiện review được phép
    };
    const [items, total] = await Promise.all([
      Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name avatar") // tên + avatar người review
        .populate("adminReply.repliedBy", "name role") // tên admin trả lời
        .lean(),
      Review.countDocuments({ product: productId }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin/Staff: trả lời hoặc sửa trả lời cho 1 review
   */
  static async adminReplyReview(adminUserId, { reviewId, content }) {
    if (!reviewId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu reviewId để phản hồi");
    }

    if (!content || !String(content).trim()) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Nội dung phản hồi không được để trống"
      );
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy đánh giá");
    }

    review.adminReply = {
      content: String(content).trim(),
      repliedAt: new Date(),
      repliedBy: adminUserId,
    };

    await review.save({ validateModifiedOnly: true });

    await review.populate("user", "name avatar");
    await review.populate("adminReply.repliedBy", "name role");

    return review;
  }

  static async getAdminReviews({
    page = 1,
    limit = 20,
    days = 14,
    rating,
    hasReply,
    q,
  }) {
    const skip = (page - 1) * limit;

    const filter = {};
    const andConditions = [];

    // Lọc theo thời gian: N ngày gần nhất
    if (days && Number(days) > 0) {
      const from = new Date();
      from.setDate(from.getDate() - Number(days));
      filter.createdAt = { $gte: from };
    }

    // Lọc theo số sao
    if (typeof rating !== "undefined" && !Number.isNaN(Number(rating))) {
      filter.rating = Number(rating);
    }

    // Lọc theo trạng thái trả lời
    if (hasReply === "replied") {
      // replied thì đơn giản: field content tồn tại & khác rỗng
      andConditions.push({
        "adminReply.content": { $exists: true, $ne: "" },
      });
    } else if (hasReply === "unreplied") {
      // unreplied: hoặc không có adminReply, hoặc content null / ""
      andConditions.push({
        $or: [
          { adminReply: { $exists: false } },
          { "adminReply.content": { $in: [null, ""] } },
        ],
      });
    }

    // Tìm kiếm theo title / content
    if (q && q.trim()) {
      const k = q.trim();
      andConditions.push({
        $or: [
          { title: { $regex: k, $options: "i" } },
          { content: { $regex: k, $options: "i" } },
        ],
      });
    }

    // Nếu có điều kiện AND thì gán vào filter
    if (andConditions.length) {
      filter.$and = andConditions;
    }

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email")
        .populate("product", "title slug")
        .populate("adminReply.repliedBy", "name role")
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async toggleVisibility(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy đánh giá");
    }

    // Đảo ngược trạng thái
    review.isVisible = !review.isVisible;
    await review.save();

    return review;
  }

  /**
   * ✅ Tính lại rating trung bình + ratingCount cho 1 product
   * Gọi sau mỗi lần upsert review
   */
  static async updateProductRating(productId) {
    // Lấy tất cả review của product đó (chỉ cần rating)
    const reviews = await Review.find({ product: productId }, "rating").lean();

    if (!reviews.length) {
      // Không có review nào -> reset về 0
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        ratingCount: 0,
      });
      return;
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const avg = sum / total;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avg * 10) / 10, // làm tròn 1 chữ số thập phân
      ratingCount: total,
    });
  }

  static async getAdminReviewStats({ days = 14 } = {}) {
    const d = Number(days);
    const safeDays = [7, 14, 30].includes(d) ? d : 14;

    // Lấy "hôm nay" = 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // from = hôm nay - (safeDays - 1)
    const from = new Date(today);
    from.setDate(from.getDate() - (safeDays - 1));

    // to = hết ngày hôm nay
    const to = new Date(today);
    to.setHours(23, 59, 59, 999);

    // Lấy tất cả review trong khoảng from → to
    const reviews = await Review.find({
      createdAt: { $gte: from, $lte: to },
    })
      .populate("product", "title images")
      .lean();

    const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`; // YYYY-MM-DD
    };

    // Thống kê tổng quát
    let totalReviews = 0;
    let sumRating = 0;
    let replied = 0;
    let unreplied = 0;

    // Phân bố sao
    const ratingDist = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Map theo ngày
    const dayMap = {};

    // Top sản phẩm
    const productMap = new Map();

    for (const r of reviews) {
      const rating = Number(r.rating || 0);
      const hasValidRating =
        !Number.isNaN(rating) && rating >= 1 && rating <= 5;

      if (hasValidRating) {
        totalReviews += 1;
        sumRating += rating;
        ratingDist[rating] = (ratingDist[rating] || 0) + 1;
      }

      // Theo ngày
      if (r.createdAt) {
        const createdAt = new Date(r.createdAt);
        const dateKey = formatDateLocal(createdAt);
        const dateLabel = createdAt.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });

        if (!dayMap[dateKey]) {
          dayMap[dateKey] = {
            dateKey,
            dateLabel,
            count: 0,
          };
        }
        dayMap[dateKey].count += 1;
      }

      // Trạng thái trả lời
      const hasReply =
        r.adminReply &&
        r.adminReply.content &&
        String(r.adminReply.content).trim().length > 0;

      if (hasReply) replied += 1;
      else unreplied += 1;

      // Top sản phẩm
      const p = r.product || {};
      const productId = p._id ? String(p._id) : r.product && String(r.product);

      if (productId) {
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            title: p.title || "Sản phẩm không rõ",
            thumb:
              Array.isArray(p.images) && p.images.length ? p.images[0] : null,
            reviewCount: 0,
            sumRating: 0,
          });
        }
        const entry = productMap.get(productId);
        entry.reviewCount += 1;
        if (hasValidRating) {
          entry.sumRating += rating;
        }
      }
    }

    // Bảng phân bố sao cho chart
    const byRating = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: ratingDist[star] || 0,
    }));

    // Bảng theo ngày cho chart
    const byDate = Object.values(dayMap).sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey)
    );

    // Top sản phẩm
    const topProducts = Array.from(productMap.values())
      .map((item) => ({
        ...item,
        avgRating: item.reviewCount ? item.sumRating / item.reviewCount : 0,
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 20); // BE trả top 20, FE hiển thị top 5

    const avgRating = totalReviews ? sumRating / totalReviews : 0;
    const replyRate = totalReviews ? (replied / totalReviews) * 100 : 0;

    return {
      days: safeDays,
      from,
      to,
      summary: {
        totalReviews,
        avgRating,
        replied,
        unreplied,
        replyRate,
      },
      charts: {
        byRating,
        byDate,
      },
      topProducts,
    };
  }
}
