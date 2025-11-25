// src/hooks/useCategories.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetCategories,
  apiGetCategoryTree,
  apiGetCategoryBySlug,
  apiGetCategoriesAdmin,
  apiGetCategoryById,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
  apiUpdateCategoryCounts,
} from "../api/categoriesApi";
import toast from "react-hot-toast";

/* ----------------------- helper lấy message lỗi ----------------------- */
const getErrMsg = (err) =>
  err?.response?.data?.message || err?.message || "Có lỗi xảy ra";

/* ----------------------- PUBLIC HOOKS (giữ nguyên) ----------------------- */
export function useCategories() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: apiGetCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const categories = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  return { categories, isLoading, error, refetch };
}

export function useCategoryTree() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categoryTree"],
    queryFn: apiGetCategoryTree,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    tree: data?.data || [],
    isLoading,
    error,
  };
}

export function useCategoryBySlug(slug) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["category", "slug", slug],
    queryFn: () => apiGetCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return {
    category: data?.data || null,
    isLoading,
    error,
  };
}

/* ----------------------- ADMIN HOOKS (giữ nguyên phần query) ----------------------- */
export function useAdminCategories(params = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminCategories", params],
    queryFn: () => apiGetCategoriesAdmin(params),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  return {
    categories: data?.data || [],
    meta: data?.meta || { page: 1, limit: 50, total: 0 },
    isLoading,
    error,
    refetch,
  };
}

export function useCategoryById(id) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["category", id],
    queryFn: () => apiGetCategoryById(id),
    enabled: !!id,
  });

  return {
    category: data?.data || null,
    isLoading,
    error,
  };
}

/* ===================== MUTATIONS với onMutate (Cách A) ===================== */

/** Tạo category */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiCreateCategory,
    onMutate: async () => {
      const toastId = toast.loading("Đang tạo danh mục...");
      return { toastId };
    },
    onSuccess: (_data, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Thêm danh mục thành công!", { id: ctx?.toastId });
    },
    onError: (error, _vars, ctx) => {
      toast.error(getErrMsg(error), { id: ctx?.toastId });
    },
  });
}

/** Cập nhật category */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => apiUpdateCategory(id, data),
    onMutate: async () => {
      const toastId = toast.loading("Đang cập nhật danh mục...");
      return { toastId };
    },
    onSuccess: (_data, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      toast.success("Cập nhật danh mục thành công!", { id: ctx?.toastId });
    },
    onError: (error, _vars, ctx) => {
      toast.error(getErrMsg(error), { id: ctx?.toastId });
    },
  });
}

/** Xoá category */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteCategory,
    onMutate: async () => {
      const toastId = toast.loading("Đang xoá danh mục...");
      return { toastId };
    },
    onSuccess: (_data, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Xóa danh mục thành công!", { id: ctx?.toastId });
    },
    onError: (error, _vars, ctx) => {
      toast.error(getErrMsg(error), { id: ctx?.toastId });
    },
  });
}

/** Recount productCount theo category */
export function useUpdateCategoryCounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiUpdateCategoryCounts,
    onMutate: async () => {
      const toastId = toast.loading("Đang cập nhật số lượng sản phẩm...");
      return { toastId };
    },
    onSuccess: (_data, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Cập nhật số lượng sản phẩm thành công!", {
        id: ctx?.toastId,
      });
    },
    onError: (error, _vars, ctx) => {
      toast.error(getErrMsg(error), { id: ctx?.toastId });
    },
  });
}
