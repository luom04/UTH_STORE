// src/validators/product.schema.js
import { z } from "zod";

const idParam = z.object({
  params: z.object({ id: z.string().length(24, "Invalid Mongo ObjectId") }),
});

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    slug: z.string().min(3).max(220).optional(), // nếu không gửi, sẽ tự tạo từ title
    description: z.string().max(20000).optional(),
    price: z.number().nonnegative(),
    priceSale: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string().url()).optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    specs: z.record(z.any()).optional(),
    status: z.enum(["active", "draft", "hidden"]).optional(),
    isFeatured: z.boolean().optional(),
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
      specs: z.record(z.any()).optional(),
      status: z.enum(["active", "draft", "hidden"]).optional(),
      isFeatured: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Nothing to update",
    }),
});

export const idSchema = idParam;
