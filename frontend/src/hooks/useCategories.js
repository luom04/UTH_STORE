// src/hooks/useCategories.js
// ✅ SHARED HOOKS - Dùng cho cả Admin và Public

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
} from "../api/categories";
import toast from "react-hot-toast";

// ============================================
// PUBLIC HOOKS (dùng ở Header, Sidebar, Filter...)
// ============================================

/**
 * Hook lấy danh sách categories (Public - active only)
 * Dùng cho: Header menu, Sidebar filter, CategoryCards...
 *
 * @example
 * const { categories, isLoading } = useCategories();
 */
export function useCategories() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: apiGetCategories,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    gcTime: 10 * 60 * 1000, // Keep 10 phút
  });

  return {
    categories: data?.data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook lấy category tree (nested)
 * Dùng cho: Mega menu, nested navigation
 *
 * @example
 * const { tree, isLoading } = useCategoryTree();
 */
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

/**
 * Hook lấy 1 category theo slug (Public)
 * Dùng cho: Category detail page, breadcrumb...
 *
 * @example
 * const { category, isLoading } = useCategoryBySlug("laptop");
 */
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

// ============================================
// ADMIN HOOKS (dùng trong Admin pages)
// ============================================

/**
 * Hook lấy danh sách categories (Admin - full access)
 * Dùng cho: Admin categories management page
 *
 * @example
 * const { categories, meta, isLoading } = useAdminCategories({ page: 1 });
 */
export function useAdminCategories(params = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminCategories", params],
    queryFn: () => apiGetCategoriesAdmin(params),
    keepPreviousData: true,
    staleTime: 60 * 1000, // 1 phút
  });

  return {
    categories: data?.data || [],
    meta: data?.meta || { page: 1, limit: 50, total: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook lấy 1 category theo ID (Admin)
 * Dùng cho: Admin edit form
 *
 * @example
 * const { category, isLoading } = useCategoryById("64abc123...");
 */
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

/**
 * Hook tạo category mới (Admin only)
 *
 * @example
 * const createMut = useCreateCategory();
 * createMut.mutate({ name: "Laptop", slug: "laptop" });
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiCreateCategory,
    onSuccess: () => {
      // Invalidate cả public và admin queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Thêm danh mục thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Thêm danh mục thất bại");
    },
  });
}

/**
 * Hook cập nhật category (Admin only)
 *
 * @example
 * const updateMut = useUpdateCategory();
 * updateMut.mutate({ id: "64abc...", name: "Laptop Gaming" });
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => apiUpdateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      toast.success("Cập nhật danh mục thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật thất bại");
    },
  });
}

/**
 * Hook xóa category (Admin only)
 *
 * @example
 * const deleteMut = useDeleteCategory();
 * deleteMut.mutate("64abc123...");
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Xóa danh mục thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Xóa danh mục thất bại");
    },
  });
}

/**
 * Hook cập nhật product count (Admin only)
 *
 * @example
 * const updateCountsMut = useUpdateCategoryCounts();
 * updateCountsMut.mutate();
 */
export function useUpdateCategoryCounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiUpdateCategoryCounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Cập nhật số lượng sản phẩm thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật thất bại");
    },
  });
}
