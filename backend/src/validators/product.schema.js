// src/validators/product.schema.js
import { z } from "zod";

const idParam = z.object({
  params: z.object({ id: z.string().length(24, "Invalid Mongo ObjectId") }),
});

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự").max(200),
    slug: z.string().min(3).max(220).optional(),
    description: z.string().max(20000).optional(),
    price: z.number().nonnegative("Giá phải >= 0"),
    priceSale: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),

    // ✅ Images: cho phép array rỗng
    images: z
      .array(z.string().url("URL ảnh không hợp lệ"))
      .optional()
      .default([]),

    category: z.string().optional(),
    brand: z.string().optional(),

    // ✅ FIX: Specs - cho phép object rỗng hoặc undefined
    specs: z
      .union([z.record(z.any()), z.object({}).passthrough()])
      .optional()
      .default({}),

    status: z.enum(["active", "draft", "hidden"]).optional().default("active"),
    isFeatured: z.boolean().optional().default(false),
  }),
});

export const updateProductSchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      title: z.string().min(3).max(200).optional(),
      slug: z.string().min(3).max(220).optional(),
      description: z.string().max(20000).optional(),
      price: z.number().nonnegative().optional(),
      priceSale: z.number().nonnegative().optional(),
      stock: z.number().int().nonnegative().optional(),
      images: z.array(z.string().url()).optional(),
      category: z.string().optional(),
      brand: z.string().optional(),

      // ✅ FIX: Specs cho update
      specs: z
        .union([z.record(z.any()), z.object({}).passthrough()])
        .optional(),

      status: z.enum(["active", "draft", "hidden"]).optional(),
      isFeatured: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Nothing to update",
    }),
});

export const idSchema = idParam;

/**
 * Schema cho update stock
 * PUT /api/products/:id/stock
 */
export const updateStockSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    diff: z.number().int("Diff phải là số nguyên"),
  }),
});
