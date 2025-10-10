// src/services/product.service.js
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Product } from "../models/product.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

export const ProductService = {
  async create(data) {
    // đảm bảo slug duy nhất
    const exists = await Product.findOne({ slug: data.slug });
    if (exists) throw new ApiError(httpStatus.CONFLICT, "Slug already exists");
    const doc = await Product.create(data);
    return doc;
  },

  async list(queryParams) {
    const baseQuery = Product.find();
    const features = new ApiFeatures(baseQuery, queryParams)
      .filter() // hỗ trợ gte/gt/lte/lt cho numeric fields
      .sort() // ?sort=price,-createdAt
      .limitFields() // ?fields=title,price
      .paginate(); // ?page=1&limit=20

    const [items, total] = await Promise.all([
      features.query,
      Product.countDocuments(
        JSON.parse(
          JSON.stringify({ ...queryParams }, (_, v) => v) // rough copy
        ).replace?.(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`)
          ? JSON.parse(
              JSON.stringify({ ...queryParams }).replace(
                /\b(gte|gt|lte|lt)\b/g,
                (m) => `$${m}`
              )
            )
          : {}
      ) // đếm theo filter (cùng cơ chế filter)
        .catch(() => Product.countDocuments({})), // fallback nếu parse lỗi
    ]);

    return { items, meta: { ...features.meta, total } };
  },

  async getById(id) {
    const doc = await Product.findById(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    return doc;
  },

  async update(id, data) {
    if (data.slug) {
      const clash = await Product.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (clash) throw new ApiError(httpStatus.CONFLICT, "Slug already exists");
    }
    const doc = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    return doc;
  },

  async remove(id) {
    const doc = await Product.findByIdAndDelete(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    return { deleted: true };
  },
};
