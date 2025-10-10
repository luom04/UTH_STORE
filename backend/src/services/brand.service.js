import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Brand } from "../models/brand.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { toSlug } from "../utils/slugify.js";

export const BrandService = {
  async create(data) {
    if (!data.slug && data.name) data.slug = toSlug(data.name);
    const exists = await Brand.findOne({ slug: data.slug });
    if (exists) throw new ApiError(httpStatus.CONFLICT, "Slug already exists");
    return Brand.create(data);
  },

  async list(queryParams) {
    const base = Brand.find();
    const features = new ApiFeatures(base, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [items, total] = await Promise.all([
      features.query,
      Brand.countDocuments(
        JSON.parse(
          JSON.stringify({ ...queryParams })
            .replace(/\"(page|limit|sort|fields)\"\\s*:\\s*\"?.*?\"?(,|})/g, "")
            .replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`)
        ).catch?.(() => ({})) || {}
      ).catch(() => Brand.countDocuments({})),
    ]);
    return { items, meta: { ...features.meta, total } };
  },

  async getById(id) {
    const doc = await Brand.findById(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    return doc;
  },

  async update(id, data) {
    if (data.name && !data.slug) data.slug = toSlug(data.name);
    if (data.slug) {
      const clash = await Brand.findOne({ slug: data.slug, _id: { $ne: id } });
      if (clash) throw new ApiError(httpStatus.CONFLICT, "Slug already exists");
    }
    const doc = await Brand.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    return doc;
  },

  async remove(id) {
    const doc = await Brand.findByIdAndDelete(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    return { deleted: true };
  },
};
