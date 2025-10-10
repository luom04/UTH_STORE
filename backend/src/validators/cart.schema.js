import { z } from "zod";

export const idParam = z.object({
  params: z.object({ id: z.string().length(24, "Invalid Mongo ObjectId") }),
});

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string().length(24),
    qty: z.coerce.number().int().min(1).default(1),
    options: z.record(z.any()).optional(),
  }),
});

export const putItemSchema = z.object({
  params: z.object({ itemId: z.string().length(24, "Invalid item id") }),
  body: z.object({
    qty: z.coerce.number().int().min(1),
    options: z.record(z.any()).optional(),
  }),
});
