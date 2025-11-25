// src/hooks/useReports.js
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "../api/report.api"; // ✅ Import API
import toast from "react-hot-toast"; // ✅ Import Toast

// Hook lấy dữ liệu tồn kho
export function useInventoryReport() {
  return useQuery({
    queryKey: ["inventoryReport"],
    queryFn: reportApi.getInventoryReport,
    select: (res) => res.data,
    staleTime: 60_000,
  });
}

/**
 * Hook xử lý logic Export Excel
 * Flow: UI -> Hook -> API -> Axios -> Server
 */
export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);

  const exportFile = async (type, rangeDays = 30) => {
    try {
      setIsExporting(true);

      // 1. Xây dựng URL
      let url = `/exports/${type}.xlsx`;

      if (type === "orders") {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - rangeDays);

        const f = fromDate.toISOString().split("T")[0];
        const t = toDate.toISOString().split("T")[0];

        url += `?from=${f}&to=${t}`;
      }

      // 2. Gọi qua API layer (thay vì gọi axios trực tiếp)
      const blobData = await reportApi.downloadExport(url);

      // 3. Xử lý file Blob (Logic của trình duyệt)
      const downloadUrl = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = downloadUrl;

      const dateStr = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `Bao_cao_${type}_${dateStr}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      // 4. Toast thông báo
      const labelMap = {
        orders: "đơn hàng & logistics",
        products: "tồn kho sản phẩm",
        categories: "danh mục",
        brands: "thương hiệu",
      };
      toast.success(`Đã xuất báo cáo ${labelMap[type] || type} thành công! 🚀`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Xuất dữ liệu thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportFile,
  };
}
