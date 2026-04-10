// src/api/products.js
import axiosInstance from "./axiosInstance";

// ✅ Admin APIs
export async function apiListProductsAdmin({
  page = 1,
  limit = 20,
  q = "",
  stock = "",
  category = "",
  fields,
}) {
  const params = { page, limit, sort: "-updatedAt" };

  if (q) params.q = q;
  if (category) params.category = category;

  if (stock === "in") params.stock = "in";
  if (stock === "out") params.stock = "out";
  if (fields) params.fields = fields;
  const res = await axiosInstance.get("/products", { params });
  return res.data;
}

export async function apiUpsertProduct(payload) {
  const body = {
    title: payload.title,
    slug: payload.slug || undefined,
    description: payload.description || "",
    // 🆕 NEW PRICING
    price: Number(payload.price) || 0, // Giá gốc
    discountPercent: Number(payload.discountPercent) || 0, // % giảm
    priceSale: payload.priceSale ? Number(payload.priceSale) : undefined, // Giá sau giảm

    stock: Number(payload.stock) || 0,
    category: payload.category || "",
    brand: payload.brand || "",
    images:
      Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images
        : [],
    thumbnails:
      Array.isArray(payload.thumbnails) && payload.thumbnails.length > 0
        ? payload.thumbnails
        : [],
    status: payload.active ? "active" : "draft",
    isFeatured: Boolean(payload.isFeatured),
    specs:
      payload.specs && typeof payload.specs === "object" ? payload.specs : {},

    gifts: Array.isArray(payload.gifts) ? payload.gifts : [],
    giftProducts: Array.isArray(payload.giftProducts)
      ? payload.giftProducts
      : [],
    promotionText: payload.promotionText || "",
    studentDiscountAmount: Number(payload.studentDiscountAmount) || 0,
  };

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) {
      delete body[key];
    }
  });

  console.log("📤 Payload gửi tới backend:", body);

  if (payload.id) {
    const res = await axiosInstance.put(`/products/${payload.id}`, body);
    return res.data;
  }

  const res = await axiosInstance.post(`/products`, body);
  return res.data;
}

export async function apiDeleteProduct(id) {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data;
}

export async function apiUpdateStock({ id, diff }) {
  const res = await axiosInstance.put(`/products/${id}/stock`, { diff });
  return res.data;
}

// export async function apiSignCloudinary() {
//   const res = await axiosInstance.post(`/uploads/sign-image`);
//   return res.data;
// }

// ====== PUBLIC APIs (Catalog + Search) ======
export async function apiListProductsPublic({
  page = 1,
  limit = 20,
  sort = "-updatedAt",
  q = "",
  category = "",
  brand = "",
  minPrice,
  maxPrice,
  rating,
  status,
  fields,
} = {}) {
  const params = { page, limit, sort };
  if (q) params.q = q;
  if (category) params.category = category;
  if (brand) params.brand = brand;
  if (status) params.status = status;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  if (rating) params.rating = rating;

  // 🆕 Đảm bảo luôn có rating & ratingCount nếu dùng fields
  if (fields) {
    const base = String(fields)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const extra = ["rating", "ratingCount"];
    const merged = [...new Set([...base, ...extra])];
    params.fields = merged.join(",");
  }

  const res = await axiosInstance.get("/products", { params });
  return res.data;
}

export async function apiSearchSuggest({ q, limit = 8 } = {}) {
  if (!q || !q.trim())
    return { success: true, data: [], meta: { page: 1, limit } };
  const params = {
    q,
    limit,
    sort: "-sold,-rating,-updatedAt",
    fields:
      "title,slug,images,price,priceSale,brand,category,rating,ratingCount,discountPercent",
  };
  const res = await axiosInstance.get("/products", { params });
  return res.data;
}

export async function apiListProducts(params = {}) {
  const res = await axiosInstance.get("/products", { params });
  return res.data;
}

// 🆕 Get single product by ID or SLUG
export async function apiGetProduct(idOrSlug) {
  console.log("🔍 [API] Fetching product with:", idOrSlug);

  try {
    // 🚨 FIX: Thử encode slug trước (phòng trường hợp có ký tự đặc biệt)
    const encodedParam = encodeURIComponent(idOrSlug);
    const url = `/products/${encodedParam}`;

    console.log("📡 [API] Request URL:", url);

    const res = await axiosInstance.get(url);

    console.log("✅ [API] Response status:", res.status);
    console.log("✅ [API] Response data:", res.data);

    return res.data;
  } catch (error) {
    console.error("❌ [API] Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    throw error;
  }
}
