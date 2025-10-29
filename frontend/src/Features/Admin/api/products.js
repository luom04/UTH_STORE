// src/Features/Admin/api/products.js
import axiosInstance from "./axiosInstance";

// Chuẩn hóa mapping query
export async function apiListProductsAdmin({
  page = 1,
  limit = 20,
  q = "",
  stock = "",
}) {
  // Map filter tồn kho đơn giản
  const params = { page, limit, sort: "-updatedAt" };
  if (q) params.q = q;
  // Quy ước: stock=in -> stock[gt]=0 ; stock=out -> stock=0
  if (stock === "in") params["stock[gt]"] = 0;
  if (stock === "out") params["stock"] = 0;

  // Admin hay Staff đều xem cùng endpoint list (public list cũng được, nhưng admin thường cần đủ fields)
  const res = await axiosInstance.get("/products", { params });
  return res.data; // { success, data, meta }
}

export async function apiUpsertProduct(payload) {
  // BE dùng slug unique. Nếu có id => PUT, không có => POST
  const body = {
    title: payload.title,
    slug: payload.slug, // để trống => BE tự toSlug(title)
    description: payload.description,
    price: payload.price,
    stock: payload.stock,
    category: payload.category,
    brand: payload.brand,
    images: payload.images || [], // array URL ảnh
    isFeatured: !!payload.isFeatured,
    status: payload.active ? "active" : "draft",
    specs: payload.specs,
  };

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
  // endpoint riêng cho stock (BE dưới phần B)
  const res = await axiosInstance.patch(`/products/${id}/stock`, { diff });
  return res.data;
}

// Lấy chữ ký Cloudinary từ server (ký an toàn)
export async function apiSignCloudinary() {
  const res = await axiosInstance.post(`/uploads/sign-image`);
  return res.data; // { timestamp, signature, cloudName, apiKey, folder? }
}
