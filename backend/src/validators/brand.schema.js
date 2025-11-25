import { z } from "zod";

export const idParam = z.object({
  params: z.object({ id: z.string().length(24, "Invalid Mongo ObjectId") }),
});

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    slug: z.string().min(2).max(160).optional(),
    description: z.string().max(5000).optional(),
    highlightText: z.string().max(2000).optional(),
    status: z.enum(["active", "hidden"]).optional(),
  }),
});

export const updateBrandSchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      name: z.string().min(2).max(120).optional(),
      slug: z.string().min(2).max(160).optional(),
      description: z.string().max(5000).optional(),
      highlightText: z.string().max(2000).optional(),
      status: z.enum(["active", "hidden"]).optional(),
    })
    .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update" }),
});
