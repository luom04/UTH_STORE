// src/hooks/useProductsPublic.js
import { useQuery } from "@tanstack/react-query";
import {
  apiListProductsPublic,
  apiSearchSuggest,
  apiGetProduct,
} from "../api/productApi";

const mapProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  image:
    Array.isArray(p.images) && p.images.length
      ? p.images[0]
      : "/placeholder.png",
  // ✅ Map thêm rating cho chắc chắn
  rating: Number(p.rating) || 0,
  ratingCount: Number(p.ratingCount) || Number(p.reviewsCount) || 0,
});

export function useCatalogProducts(params) {
  return useQuery({
    queryKey: ["publicProducts", params],
    queryFn: () => apiListProductsPublic(params),
    keepPreviousData: true,
    staleTime: 30_000,
    select: (res) => {
      const list = (res?.data || []).map((p) => ({
        ...p,
        id: p._id || p.id,
        image:
          Array.isArray(p.images) && p.images.length ? p.images[0] : undefined,
      }));
      return {
        list,
        meta: res?.meta || { page: 1, limit: params?.limit || 20 },
      };
    },
  });
}

export function useSearchSuggest(q, { limit = 6, enabled } = {}) {
  return useQuery({
    queryKey: ["searchSuggest", q, limit],
    queryFn: () => apiSearchSuggest({ q, limit }),
    enabled: enabled ?? Boolean(q && q.trim()),
    staleTime: 60_000,
    select: (res) =>
      (res?.data || []).map((p) => ({
        id: p._id || p.id,
        title: p.title,
        slug: p.slug,
        image:
          Array.isArray(p.images) && p.images.length ? p.images[0] : undefined,
        price: p.price,
        priceSale: p.priceSale,
        brand: p.brand,
        category: p.category,
      })),
  });
}

// ✅ Best-sellers theo category (slug)
export function useBestSellers({ category, limit = 10 }) {
  return useQuery({
    queryKey: ["bestSellers", { category, limit }],
    enabled: !!category,
    keepPreviousData: true,
    staleTime: 60_000,
    queryFn: () =>
      apiListProductsPublic({
        category, // slug danh mục
        limit,
        sort: "-sold,-rating,-updatedAt",
        // 👇 Fields này đã đúng rồi
        fields:
          "title,slug,images,price,priceSale,brand,category,sold,rating,ratingCount,specs,discountPercent",
      }),
    select: (res) => ({
      list: (res?.data || []).map(mapProduct),
    }),
  });
}

// 🆕 Get single product (for ProductDetail page)
export function useProduct(idOrSlug) {
  return useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: () => apiGetProduct(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 60_000,
    select: (res) => {
      const p = res?.data;
      if (!p) return null;

      return {
        ...p,
        id: p._id || p.id,
        // Fallback image từ images array hoặc thumbnails
        image:
          Array.isArray(p.images) && p.images.length
            ? p.images[0]
            : Array.isArray(p.thumbnails) && p.thumbnails.length
            ? p.thumbnails[0]
            : undefined,
      };
    },
  });
}

// ✅ [FIXED] Hook cho trang Search Result
export function useProductSearch({ q, limit = 20 }) {
  const hasQuery = !!(q && q.trim());

  return useQuery({
    queryKey: ["searchProducts", { q, limit }],
    enabled: hasQuery,

    queryFn: async () => {
      const response = await apiListProductsPublic({
        q: q.trim(),
        page: 1,
        limit,
        sort: "-sold,-rating,-updatedAt",
        status: "active",
        fields:
          "title,slug,images,price,priceSale,brand,category,sold,rating,ratingCount,specs,discountPercent",
      });

      // 🚨 Backend trả về { success, data, meta }
      // Transform về format component expect: { list, total }
      return {
        list: response.data || [], // ← FIX: response.data thay vì response.list
        total: response.meta?.total || 0, // ← FIX: response.meta.total
        meta: response.meta || {},
      };
    },

    keepPreviousData: true,
    staleTime: 30000,
  });
}
