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
    console.log("📥 Query params nhận được:", queryParams);

    // ✅ FIX: Chỉ dùng text search khi có query q và q không rỗng
    if (queryParams.q && queryParams.q.trim().length > 0) {
      console.log("🔍 Dùng TEXT SEARCH");
      return this.textSearch(queryParams);
    }

    // ✅ Nếu không có search (hoặc q rỗng), dùng ApiFeatures như cũ
    console.log("📋 Dùng API FEATURES");
    const baseQuery = Product.find();
    const features = new ApiFeatures(baseQuery, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    console.log("🔧 Query được build:", features.query.getQuery());
    console.log("🔧 Query options:", features.query.getOptions());

    const [items, total] = await Promise.all([
      features.query.lean(),
      Product.countDocuments(this.buildFilterFromParams(queryParams)),
    ]);

    console.log("✅ Tìm thấy:", items.length, "items, total:", total);

    return { items, meta: { ...features.meta, total } };
  },

  // ✅ NEW: Text search với scoring (relevance)
  async textSearch(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 20;
    const skip = (page - 1) * limit;
    const searchText = queryParams.q.trim();

    // Build filter
    const filter = { $text: { $search: searchText } };

    // Stock filter
    if (queryParams.stock === "in") {
      filter.stock = { $gt: 0 };
    } else if (queryParams.stock === "out") {
      filter.stock = 0;
    }

    // Category filter
    if (queryParams.category) {
      filter.category = queryParams.category;
    }

    // Brand filter
    if (queryParams.brand) {
      filter.brand = queryParams.brand;
    }

    // ✅ Query với text score (để sort theo độ liên quan)
    const [items, total] = await Promise.all([
      Product.find(filter, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } }) // Sort theo relevance
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Helper: Build filter từ query params (dùng cho countDocuments)
  buildFilterFromParams(params) {
    const filter = {};

    // Stock filter
    if (params.stock === "in") filter.stock = { $gt: 0 };
    if (params.stock === "out") filter.stock = 0;

    // Category filter
    if (params.category) filter.category = params.category;

    // Brand filter
    if (params.brand) filter.brand = params.brand;

    // Status filter
    if (params.status) filter.status = params.status;

    // isFeatured filter
    if (params.isFeatured !== undefined) {
      filter.isFeatured = params.isFeatured === "true";
    }

    // Price range
    if (params.minPrice || params.maxPrice) {
      filter.price = {};
      if (params.minPrice) filter.price.$gte = Number(params.minPrice);
      if (params.maxPrice) filter.price.$lte = Number(params.maxPrice);
    }

    // ✅ KHÔNG search trong q ở đây (để ApiFeatures xử lý)

    return filter;
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

  async updateStock(id, diff = 0) {
    const doc = await Product.findById(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    const next = Math.max(0, (doc.stock || 0) + diff);
    doc.stock = next;
    await doc.save();
    return doc;
  },
};
