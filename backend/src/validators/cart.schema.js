// src/validators/cart.schema.js
import { z } from "zod";

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    qty: z.number().int().min(1).optional().default(1),
    options: z.record(z.any()).optional(),
  }),
});

export const putItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1),
  }),
  body: z.object({
    qty: z.number().int().min(1).optional(),
    options: z.record(z.any()).optional(),
  }),
});
