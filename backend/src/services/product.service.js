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
    // if (queryParams.brand) {
    //   filter.brand = queryParams.brand;
    // }

    // Status filter
    if (queryParams.status) {
      filter.status = queryParams.status;
    } else {
      filter.status = "active";
    }

    // ✅ KHÔNG truyền projection trong find() nữa để tránh mix include/exclude
    const query = Product.find(filter);

    // ✅ Nếu FE có fields => select kiểu INCLUDE
    if (queryParams.fields) {
      const selectStr = String(queryParams.fields)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");

      query.select(selectStr);
    } else {
      // ✅ Nếu không có fields => có thể exclude __v thoải mái
      query.select("-__v");
    }

    const [items, total] = await Promise.all([
      query
        .sort({ score: { $meta: "textScore" } }) // sort theo độ liên quan
        .skip(skip)
        .limit(limit)
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
    // if (params.brand) filter.brand = params.brand;

    // 🔥 STATUS FILTER
    if (params.status) {
      filter.status = params.status;
    } else {
      filter.status = "active";
    }

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

    return filter;
  },

  async getById(id) {
    const doc = await Product.findById(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    return doc;
  },

  // 🆕 Get by slug
  async getBySlug(slug) {
    const doc = await Product.findOne({ slug, status: "active" });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    return doc;
  },

  //🆕 Get by ID or Slug (helper method)
  async getByIdOrSlug(param) {
    console.log("🔍 [Service] getByIdOrSlug called with:", param);

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);

    if (isObjectId) {
      console.log("📌 [Service] Detected as ObjectId");
      return this.getById(param);
    } else {
      console.log("📌 [Service] Detected as slug");
      return this.getBySlug(param);
    }
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

  // ✅ NEW: search gợi ý cho dropdown
  async searchSuggest(q, limit = 8, fields) {
    const lim = Math.min(Math.max(parseInt(limit) || 8, 1), 20);
    const filter = { status: "active" };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: regex },
        { slug: regex },
        // { brand: regex },
        { category: regex },
        { description: regex },
      ];
    }

    const projection =
      fields?.split(",").join(" ") ||
      "title slug images price priceSale brand rating ratingCount discountPercent";

    const items = await Product.find(filter)
      .select(projection)
      .sort({ sold: -1, updatedAt: -1 })
      .limit(lim)
      .lean();

    return items;
  },
};
