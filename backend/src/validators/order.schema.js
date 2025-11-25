import { z } from "zod";

const shippingAddressSchema = z.object({
  // [FIX] Zod fullname => Mongoose fullName
  fullname: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  // [FIX] Zod address => Mongoose line1
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  province: z
    .object({
      code: z.string(),
      name: z.string(),
    })
    .optional(),
  district: z
    .object({
      code: z.string(),
      name: z.string(),
    })
    .optional(),
  ward: z
    .object({
      code: z.string(),
      name: z.string(),
    })
    .optional(),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z
      .enum(["COD", "BANK_TRANSFER", "VNPAY", "MOMO"])
      .default("COD"),
    note: z.string().max(500).optional().default(""),
    couponCode: z.string().trim().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "shipping",
      "completed",
      "canceled",
    ]),
    note: z.string().max(500).optional(),
  }),
});
