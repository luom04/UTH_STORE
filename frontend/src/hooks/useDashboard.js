// src/hooks/useDashboard.js
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api"; // ✅ Import API layer

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,

    // Lấy field `data` từ response của axios (backend trả về { success, data })
    select: (response) => response.data,

    // Cache dữ liệu trong 5 phút để tránh spam request mỗi khi reload trang
    staleTime: 5 * 60 * 1000,

    // Giữ data cũ khi đang fetch mới (trải nghiệm mượt hơn)
    keepPreviousData: true,
  });
}
