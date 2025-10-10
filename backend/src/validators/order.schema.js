import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    // cho phép tạo từ cart (mặc định) hoặc từ items truyền vào
    useCart: z.boolean().optional().default(true),
    items: z
      .array(
        z.object({
          productId: z.string().length(24),
          qty: z.coerce.number().int().min(1),
          options: z.record(z.any()).optional(),
        })
      )
      .optional(),

    shippingAddress: z.object({
      fullName: z.string().min(2),
      phone: z.string().min(8),
      line1: z.string().min(3),
      line2: z.string().optional(),
      district: z.string().min(2),
      city: z.string().min(2),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }),
    note: z.string().max(2000).optional(),
    paymentMethod: z.enum(["cod", "online"]).default("cod"),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "shipping",
      "completed",
      "canceled",
    ]),
    // admin có thể cập nhật paymentStatus khi cần
    paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
  }),
});
