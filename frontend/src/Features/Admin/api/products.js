// src/Features/Admin/api/products.js
import axiosInstance from "./axiosInstance";

// Chuẩn hóa mapping query
export async function apiListProductsAdmin({
  page = 1,
  limit = 20,
  q = "",
  stock = "",
}) {
  const params = { page, limit, sort: "-updatedAt" };
  if (q) params.q = q;

  // Quy ước: stock=in -> stock[gt]=0 ; stock=out -> stock=0
  if (stock === "in") params["stock[gt]"] = 0;
  if (stock === "out") params["stock"] = 0;

  const res = await axiosInstance.get("/products", { params });
  return res.data; // { success, data, meta }
}

export async function apiUpsertProduct(payload) {
  // ✅ QUAN TRỌNG: Chuẩn hóa payload theo backend schema
  const body = {
    title: payload.title,
    slug: payload.slug || undefined, // BE tự tạo nếu không có
    description: payload.description || "",
    price: Number(payload.price) || 0,
    stock: Number(payload.stock) || 0,
    category: payload.category || "",
    brand: payload.brand || "",
    images:
      Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images
        : [],

    // ✅ FIX: Chuyển active thành status
    status: payload.active ? "active" : "draft",

    isFeatured: Boolean(payload.isFeatured),

    // ✅ FIX: Đảm bảo specs là object (không phải undefined)
    specs:
      payload.specs && typeof payload.specs === "object" ? payload.specs : {},
  };

  // Loại bỏ các field undefined (Zod không thích undefined)
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
  const res = await axiosInstance.put(`/products/${id}/stock`, { diff }); // PUT thay vì PATCH
  return res.data;
}

// Lấy chữ ký Cloudinary từ server (ký an toàn)
export async function apiSignCloudinary() {
  const res = await axiosInstance.post(`/uploads/sign-image`);
  return res.data; // { timestamp, signature, cloudName, apiKey, folder }
}
