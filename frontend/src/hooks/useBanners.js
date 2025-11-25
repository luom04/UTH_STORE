import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerApi } from "../api/banner.api";
import toast from "react-hot-toast";

// Hook cho trang chủ (Public)
export function useBanners() {
  return useQuery({
    queryKey: ["banners", "public"],
    queryFn: bannerApi.getPublic,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
}

// Hook cho trang Admin
export function useAdminBanners() {
  return useQuery({
    queryKey: ["banners", "admin"],
    queryFn: bannerApi.getAdmin,
  });
}

export function useBannerActions() {
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: bannerApi.create,
    onSuccess: () => {
      toast.success("Thêm banner thành công");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => bannerApi.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: bannerApi.delete,
    onSuccess: () => {
      toast.success("Đã xóa banner");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  return { createMut, updateMut, deleteMut };
}
