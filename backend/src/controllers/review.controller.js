// backend/src/controllers/review.controller.js
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { ReviewService } from "../services/review.service.js";

/**
 * GET /api/reviews/my?orderId=...&productId=...
 * Lấy review của chính user cho 1 sản phẩm trong 1 đơn
 */
export const getMyReviewController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId, productId } = req.query;

    if (!orderId || !productId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Thiếu orderId hoặc productId"
      );
    }

    const review = await ReviewService.getMyReview(userId, {
      orderId,
      productId,
    });

    return res.json({
      success: true,
      data: review || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reviews
 * body: { orderId, productId, rating, title, content, images }
 * => Tạo / sửa review (upsert)
 */
export const upsertMyReviewController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId, productId, rating, title, content, images } = req.body;

    const review = await ReviewService.upsertMyReview(userId, {
      orderId,
      productId,
      rating,
      title,
      content,
      images,
    });

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reviews/product/:productId?page=&limit=
 * Public: xem review theo sản phẩm
 */
export const getProductReviewsController = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await ReviewService.getProductReviews(productId, {
      page,
      limit,
    });

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reviews/admin/:id/reply
 * Admin/Staff: trả lời hoặc sửa trả lời cho 1 review
 */
export const adminReplyReviewController = async (req, res, next) => {
  try {
    const adminUserId = req.user._id;
    const { id } = req.params;
    const { content } = req.body;

    const review = await ReviewService.adminReplyReview(adminUserId, {
      reviewId: id,
      content,
    });

    return res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleReviewVisibilityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await ReviewService.toggleVisibility(id);

    return res.json({
      success: true,
      data: review,
      message: review.isVisible ? "Đã hiện đánh giá" : "Đã ẩn đánh giá",
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminReviewsController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const days = Number(req.query.days) || 14;
    const rating = req.query.rating ? Number(req.query.rating) : undefined;
    const hasReply = req.query.hasReply;
    const q = req.query.q || "";

    const result = await ReviewService.getAdminReviews({
      page,
      limit,
      days,
      rating,
      hasReply,
      q,
    });

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminReviewStatsController = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 14;

    const data = await ReviewService.getAdminReviewStats({ days });

    return res.json({
      success: true,
      data, // { days, from, to, summary, charts, topProducts }
    });
  } catch (err) {
    next(err);
  }
};
