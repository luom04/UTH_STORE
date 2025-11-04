// src/Features/Admin/api/products.js
import axiosInstance from "./axiosInstance";

// ✅ FIX: Thêm category filter
export async function apiListProductsAdmin({
  page = 1,
  limit = 20,
  q = "",
  stock = "",
  category = "", // ✅ NEW: Category filter
}) {
  const params = { page, limit, sort: "-updatedAt" };
  if (q) params.q = q;
  if (category) params.category = category; // ✅ NEW

  // Stock filter
  if (stock === "in") params.stock = "in";
  if (stock === "out") params.stock = "out";

  const res = await axiosInstance.get("/products", { params });
  return res.data;
}

export async function apiUpsertProduct(payload) {
  const body = {
    title: payload.title,
    slug: payload.slug || undefined,
    description: payload.description || "",
    price: Number(payload.price) || 0,
    stock: Number(payload.stock) || 0,
    category: payload.category || "",
    brand: payload.brand || "",
    images:
      Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images
        : [],
    status: payload.active ? "active" : "draft",
    isFeatured: Boolean(payload.isFeatured),
    specs:
      payload.specs && typeof payload.specs === "object" ? payload.specs : {},
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

export async function apiSignCloudinary() {
  const res = await axiosInstance.post(`/uploads/sign-image`);
  return res.data;
}
