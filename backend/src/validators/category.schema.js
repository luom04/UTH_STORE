// src/validators/category.schema.js
import { z } from "zod";

const idParam = z.object({
  params: z.object({ id: z.string().length(24, "Invalid Mongo ObjectId") }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(100),
    slug: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional(),

    // SỬA LẠI "image" VÀ THÊM "banner"
    image: z
      .string()
      .url("URL ảnh không hợp lệ")
      .or(z.literal("")) // Cho phép chuỗi rỗng ""
      .optional(),
    banner: z
      .string()
      .url("URL banner không hợp lệ")
      .or(z.literal("")) // Cho phép chuỗi rỗng ""
      .optional(),
    // KẾT THÚC SỬA

    icon: z.string().max(50).optional(),
    parent: z.string().length(24).optional().nullable(),
    order: z.number().int().min(0).optional(),
    status: z.enum(["active", "inactive"]).optional().default("active"),
    seo: z
      .object({
        title: z.string().max(100).optional(),
        description: z.string().max(200).optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      slug: z.string().min(2).max(120).optional(),
      description: z.string().max(500).optional(),

      // SỬA LẠI "image" VÀ THÊM "banner"
      image: z
        .string()
        .url("URL ảnh không hợp lệ")
        .or(z.literal("")) // Cho phép chuỗi rỗng ""
        .optional(),
      banner: z
        .string()
        .url("URL banner không hợp lệ")
        .or(z.literal("")) // Cho phép chuỗi rỗng ""
        .optional(),
      // KẾT THÚC SỬA

      icon: z.string().max(50).optional(),
      parent: z.string().length(24).optional().nullable(),
      order: z.number().int().min(0).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      seo: z
        .object({
          title: z.string().max(100).optional(),
          description: z.string().max(200).optional(),
          keywords: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Nothing to update",
    }),
});

export const idSchema = idParam;
