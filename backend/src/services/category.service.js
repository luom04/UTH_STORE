import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Category } from "../models/category.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { toSlug } from "../utils/slugify.js";

export const CategoryService = {
  async create(data) {
    if (!data.slug && data.name) data.slug = toSlug(data.name);
    const exists = await Category.findOne({ slug: data.slug });
    if (exists) throw new ApiError(httpStatus.CONFLICT, "Slug already exists");
    return Category.create(data);
  },

  async list(queryParams) {
    const base = Category.find();
    const features = new ApiFeatures(base, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [items, total] = await Promise.all([
      features.query,
      Category.countDocuments(
        // đếm theo filter (copy cơ chế trong ApiFeatures.filter)
        JSON.parse(
          JSON.stringify({ ...queryParams })
            .replace(/\"(page|limit|sort|fields)\"\\s*:\\s*\"?.*?\"?(,|})/g, "")
            .replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`)
        ).catch?.(() => ({})) || {}
      ).catch(() => Category.countDocuments({})),
    ]);
    return { items, meta: { ...features.meta, total } };
  },

  async getById(id) {
    const doc = await Category.findById(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    return doc;
  },

  async update(id, data) {
    if (data.name && !data.slug) data.slug = toSlug(data.name);
    if (data.slug) {
      const clash = await Category.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (clash) throw new ApiError(httpStatus.CONFLICT, "Slug already exists");
    }
    const doc = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    return doc;
  },

  async remove(id) {
    const doc = await Category.findByIdAndDelete(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    return { deleted: true };
  },
};
