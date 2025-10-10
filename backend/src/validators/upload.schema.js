// src/validators/upload.schema.js
import { z } from "zod";

export const signParamsSchema = z.object({
  body: z.object({
    folder: z.string().min(1).optional(), // nếu không gửi -> dùng default từ ENV
  }),
});

export const deleteByPublicIdSchema = z.object({
  body: z.object({
    publicId: z.string().min(3), // ví dụ: uth_store/products/abc123
    resourceType: z.enum(["image", "video", "raw"]).optional().default("image"),
  }),
});
