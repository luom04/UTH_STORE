// src/services/category.service.js
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

export const CategoryService = {
  /**
   * Tạo category mới
   */
  async create(data) {
    // Check slug tồn tại chưa
    const exists = await Category.findOne({ slug: data.slug });
    if (exists) {
      throw new ApiError(httpStatus.CONFLICT, "Slug đã tồn tại");
    }

    const category = await Category.create(data);
    return category;
  },

  /**
   * Lấy danh sách categories
   */
  async list(queryParams = {}) {
    const {
      page = 1,
      limit = 50,
      sort = "order",
      status,
      parent,
    } = queryParams;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (parent !== undefined) {
      filter.parent = parent === "null" || parent === "" ? null : parent;
    }

    const [items, total] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("parent", "name slug")
        .lean(),
      Category.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  },

  /**
   * Lấy category theo ID
   */
  async getById(id) {
    const category = await Category.findById(id).populate(
      "parent",
      "name slug"
    );
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy danh mục");
    }
    return category;
  },

  /**
   * Lấy category theo slug
   */
  async getBySlug(slug) {
    const category = await Category.findOne({ slug }).populate(
      "parent",
      "name slug"
    );
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy danh mục");
    }
    return category;
  },

  /**
   * Cập nhật category
   */
  async update(id, data) {
    // Check slug conflict
    if (data.slug) {
      const clash = await Category.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (clash) {
        throw new ApiError(httpStatus.CONFLICT, "Slug đã tồn tại");
      }
    }

    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy danh mục");
    }

    return category;
  },

  /**
   * Xóa category
   */
  async remove(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy danh mục");
    }

    // Check xem có sản phẩm nào đang dùng category này không
    const productCount = await Product.countDocuments({
      category: category.slug,
    });

    if (productCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Không thể xóa. Còn ${productCount} sản phẩm trong danh mục này.`
      );
    }

    // Check xem có category con không
    const childCount = await Category.countDocuments({ parent: id });
    if (childCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Không thể xóa. Còn ${childCount} danh mục con.`
      );
    }

    await category.deleteOne();
    return { deleted: true };
  },

  /**
   * Cập nhật product count cho tất cả categories
   */
  async updateAllProductCounts() {
    const categories = await Category.find();
    for (const category of categories) {
      await category.updateProductCount();
    }
    return { updated: categories.length };
  },

  /**
   * Lấy category tree (nested)
   */
  async getTree() {
    const categories = await Category.find({ status: "active" })
      .sort("order")
      .lean();

    // Build tree structure
    const categoryMap = {};
    const tree = [];

    // First pass: create map
    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat, children: [] };
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      if (cat.parent) {
        const parent = categoryMap[cat.parent];
        if (parent) {
          parent.children.push(categoryMap[cat._id]);
        }
      } else {
        tree.push(categoryMap[cat._id]);
      }
    });

    return tree;
  },
};
