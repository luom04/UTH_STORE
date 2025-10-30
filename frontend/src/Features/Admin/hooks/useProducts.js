// src/Features/Admin/hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiListProductsAdmin, // ✅ Sửa: apiListProducts -> apiListProductsAdmin
  apiUpsertProduct,
  apiDeleteProduct,
  apiUpdateStock,
  apiSignCloudinary,
} from "../api/products";
import toast from "react-hot-toast"; // ✅ Thêm import toast

/** Query danh sách sản phẩm (phân trang + filter) */
export function useAdminProducts(params) {
  return useQuery({
    queryKey: ["adminProducts", params],
    queryFn: () => apiListProductsAdmin(params), // ✅ Sửa tên function
    keepPreviousData: true,
  });
}

/** Create/Update product (dùng chung một function) */
export function useUpsertProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiUpsertProduct,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] }); // ✅ Sửa key cho đồng nhất
      const message = variables.id
        ? "Cập nhật sản phẩm thành công!"
        : "Thêm sản phẩm thành công!";
      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.message || "Thao tác thất bại");
    },
  });
}

/** Xoá sản phẩm (ADMIN) */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Xóa sản phẩm thành công!"); // ✅ Thêm toast
    },
    onError: (error) => {
      toast.error(error.message || "Xóa sản phẩm thất bại"); // ✅ Thêm toast
    },
  });
}

/** Cập nhật tồn kho (STAFF + ADMIN) */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, diff }) => apiUpdateStock({ id, diff }), // ✅ Sửa: truyền object
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Cập nhật tồn kho thành công!"); // ✅ Thêm toast
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật tồn kho thất bại"); // ✅ Thêm toast
    },
  });
}

// src/Features/Admin/hooks/useProducts.js
/** Ký upload Cloudinary (client hỏi BE để lấy signature, timestamp…) */
export function useSignCloudinary() {
  return useMutation({
    mutationFn: apiSignCloudinary,
    onError: (error) => {
      toast.error(error.message || "Không thể lấy chữ ký Cloudinary"); // ✅ Thêm toast
    },
  });
}
