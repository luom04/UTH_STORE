// backend/src/validators/review.schema.js
import { z } from "zod";

/**
 * Validate body tạo / sửa (upsert) review
 * POST /api/reviews
 */
export const upsertReviewSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "orderId là bắt buộc"),
    productId: z.string().min(1, "productId là bắt buộc"),

    // Cho phép FE gửi string, tự ép sang number
    rating: z.coerce
      .number({
        invalid_type_error: "Rating phải là số",
      })
      .min(1, "Rating tối thiểu là 1")
      .max(5, "Rating tối đa là 5"),

    title: z.string().trim().max(200, "Tiêu đề quá dài").optional(),

    content: z.string().trim().max(2000, "Nội dung quá dài").optional(),

    // URL ảnh từ Cloudinary, nhưng để mềm một chút (không bắt buộc url())
    images: z
      .array(z.string().trim().min(1, "URL ảnh không hợp lệ"))
      .optional(),
  }),
});

/**
 * Validate nội dung Admin trả lời review
 * PUT /api/reviews/admin/:id/reply
 */
export const adminReplyReviewSchema = z.object({
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Nội dung phản hồi không được để trống")
      .max(2000, "Nội dung phản hồi quá dài"),
  }),
});
