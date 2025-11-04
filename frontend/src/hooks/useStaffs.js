// src/hooks/useStaffs.js - ALREADY SUPPORTS SALARY
// ✅ Không cần sửa gì, vì updateStaff() đã nhận patch object
// Chỉ cần đảm bảo API call đúng format:

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStaffs,
  createStaff,
  updateStaff,
  toggleActiveStaff,
  deleteStaff,
} from "../api/staffs";
import toast from "react-hot-toast";

/**
 * Query danh sách staffs
 */
export function useStaffs(params = {}) {
  return useQuery({
    queryKey: ["staffs", params],
    queryFn: () => fetchStaffs(params),
    keepPreviousData: true,
    staleTime: 60000,
  });
}

/**
 * Mutation: Tạo staff mới
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      toast.success("Tạo nhân viên thành công!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;

      // Better error messages
      if (message?.includes("already exists")) {
        toast.error("❌ Email này đã tồn tại!");
      } else {
        toast.error(`❌ ${message || "Tạo nhân viên thất bại"}`);
      }
    },
  });
}

/**
 * Mutation: Cập nhật staff
 * ✅ Support cả salary và các fields khác
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStaff, // { id, patch: { salary, name, ... } }
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      toast.success("Cập nhật thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật thất bại");
    },
  });
}

/**
 * Mutation: Kích hoạt/Vô hiệu hóa staff
 */
export function useToggleActiveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleActiveStaff,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      const message = data.data.active ? "Đã kích hoạt" : "Đã vô hiệu hóa";
      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.message || "Thao tác thất bại");
    },
  });
}

/**
 * Mutation: Xóa staff
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      toast.success("Xóa nhân viên thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Xóa nhân viên thất bại");
    },
  });
}
