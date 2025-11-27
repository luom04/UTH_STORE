// src/hooks/useDashboard.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import toast from "react-hot-toast";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
    select: (response) => response.data, // { ...stats, chart, notes }
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
}

export function useSaveDashboardNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content) => dashboardApi.saveNote(content),
    onSuccess: () => {
      toast.success("Đã lưu ghi chú thành công!");
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: () => {
      toast.error("Không thể lưu ghi chú. Vui lòng thử lại!");
    },
  });
}

// ✅ Hook sửa ghi chú
export function useUpdateDashboardNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, content }) =>
      dashboardApi.updateNote(noteId, content),
    onSuccess: () => {
      toast.success("Đã cập nhật ghi chú!");
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: () => {
      toast.error("Không thể cập nhật ghi chú.");
    },
  });
}

// ✅ Hook xóa ghi chú
export function useDeleteDashboardNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId) => dashboardApi.deleteNote(noteId),
    onSuccess: () => {
      toast.success("Đã xóa ghi chú!");
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: () => {
      toast.error("Không thể xóa ghi chú.");
    },
  });
}
