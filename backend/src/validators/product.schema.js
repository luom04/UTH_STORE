import { z } from "zod";

// 🆕 FIX: Chấp nhận cả ObjectId (24 ký tự) và slug (bất kỳ độ dài)
const idParam = z.object({
  params: z.object({
    id: z.string().min(1, "ID or slug is required"),
  }),
});

// ✅ Helper: Validate URL linh hoạt - Fix markdown links
const flexibleUrlSchema = z.string().transform((val) => {
  if (!val || val.trim() === "") return "";

  let url = val.trim();

  const markdownMatch = url.match(/\[(.+?)\]\((.+?)\)/);
  if (markdownMatch) {
    url = markdownMatch[2];
  }

  url = url.replace(/^\[|\]$/g, "");

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try {
    new URL(url);
    return url;
  } catch (error) {
    console.warn(`⚠️ URL không hợp lệ (bỏ qua): ${val}`);
    return "";
  }
});

// ✅ schema item quà tặng trong kho
const giftProductItemSchema = z.object({
  product: z.string().min(1, "productId quà tặng là bắt buộc"),
  // bạn muốn bỏ qty ở FE -> để optional, BE default = 1
  qty: z.number().int().min(1).optional(),
});

export const createProductSchema = z.object({
  body: z
    .object({
      title: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự").max(200),
      slug: z.string().min(3).max(220).optional(),
      description: z.string().max(20000).optional(),

      price: z.number().nonnegative("Giá gốc phải >= 0").optional(),
      discountPercent: z.number().min(0).max(100).optional().default(0),
      priceSale: z.number().nonnegative().optional(),

      stock: z.number().int().nonnegative().optional(),

      images: z
        .array(flexibleUrlSchema)
        .optional()
        .default([])
        .transform((urls) => urls.filter((url) => url !== "")),

      thumbnails: z
        .array(flexibleUrlSchema)
        .optional()
        .default([])
        .transform((urls) => urls.filter((url) => url !== "")),

      category: z.string().optional(),
      brand: z.string().optional(),

      specs: z
        .union([z.record(z.any()), z.object({}).passthrough()])
        .optional()
        .default({}),

      status: z
        .enum(["active", "draft", "hidden"])
        .optional()
        .default("active"),
      isFeatured: z.boolean().optional().default(false),

      gifts: z.array(z.string()).optional().default([]),

      // ✅ NEW: giftProducts
      giftProducts: z.array(giftProductItemSchema).optional().default([]),

      promotionText: z.string().optional().default(""),
      studentDiscountAmount: z.number().int().nonnegative().optional(),
    })
    .superRefine((data, ctx) => {
      const hasPrice = typeof data.price === "number";
      const hasSale = typeof data.priceSale === "number";
      if (!hasPrice && !hasSale) {
        ctx.addIssue({
          path: ["priceSale"],
          code: z.ZodIssueCode.custom,
          message: "Cần nhập 'price' HOẶC 'priceSale'.",
        });
      }
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
      discountPercent: z.number().min(0).max(100).optional(),
      priceSale: z.number().nonnegative().optional(),

      stock: z.number().int().nonnegative().optional(),

      images: z
        .array(flexibleUrlSchema)
        .optional()
        .transform((urls) => {
          if (!urls) return undefined;
          return urls.filter((url) => url !== "");
        }),

      thumbnails: z
        .array(flexibleUrlSchema)
        .optional()
        .transform((urls) => {
          if (!urls) return undefined;
          return urls.filter((url) => url !== "");
        }),

      category: z.string().optional(),
      brand: z.string().optional(),

      specs: z
        .union([z.record(z.any()), z.object({}).passthrough()])
        .optional(),

      status: z.enum(["active", "draft", "hidden"]).optional(),
      isFeatured: z.boolean().optional(),

      // ❌ BỎ default([]) để không xoá data cũ
      gifts: z.array(z.string()).optional(),

      // ✅ NEW: giftProducts (optional, không default)
      giftProducts: z.array(giftProductItemSchema).optional(),

      // ❌ BỎ default("") để không ghi đè rỗng
      promotionText: z.string().optional(),

      studentDiscountAmount: z.number().int().nonnegative().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Nothing to update",
    }),
});

export const idSchema = idParam;

export const updateStockSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    diff: z.number().int("Diff phải là số nguyên"),
  }),
});
