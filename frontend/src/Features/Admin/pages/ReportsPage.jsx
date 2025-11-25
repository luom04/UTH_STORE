// src/Features/Admin/pages/ReportsPage.jsx
import { useMemo, useState } from "react";
import {
  useInventoryReport,
  useExportData,
} from "../../../hooks/useReports.js"; // ✅ Import hook mới
import { useAdminOrderStats } from "../../../hooks/useOrders.js";
import { useAuth } from "../../../hooks/useAuth.js";

import {
  BarChart2,
  PackageSearch,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";

import OrderStatsChart from "../components/OrderStatsChart.jsx";
import OrderStatusSummaryChart from "../components/OrderStatusSummaryChart.jsx";
import InventoryStatsChart from "../components/InventoryStatsChart.jsx";

// Hàm format %
function formatPercent(n, total) {
  if (!total || !n) return "0%";
  return `${Math.round((n * 100) / total)}%`;
}

export default function ReportsPage() {
  const { user } = useAuth() || {};
  const isAdmin = user?.role === "admin";

  // State chọn khoảng thời gian (mặc định 30 ngày)
  const [rangeDays, setRangeDays] = useState(30);

  // --- 1. HOOKS LẤY DỮ LIỆU ---

  // Hook Export (đã tách logic toast/axios sang đây)
  const { isExporting, exportFile } = useExportData();

  // Hook Thống kê đơn hàng
  const {
    data: orderStatsRes,
    isLoading: statsLoading,
    isError: statsError,
  } = useAdminOrderStats(rangeDays);

  // Xử lý dữ liệu đơn hàng (Fix lỗi key buckets ở các bước trước)
  const buckets = orderStatsRes?.buckets || [];
  const displayDays = orderStatsRes?.summary?.days || rangeDays;

  const orderStatusSummary = useMemo(() => {
    const summary = {
      totalOrders: 0,
      pending: 0,
      confirmed: 0,
      shipping: 0,
      completed: 0,
      canceled: 0,
    };

    for (const b of buckets) {
      summary.totalOrders += b.totalOrders || 0;
      summary.pending += b.pending || 0;
      summary.confirmed += b.confirmed || 0;
      summary.shipping += b.shipping || 0;
      summary.completed += b.completed || 0;
      summary.canceled += b.canceled || 0;
    }
    return summary;
  }, [buckets]);

  // Hook Thống kê tồn kho
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    isError: inventoryError,
  } = useInventoryReport();

  const totalProducts = inventoryData?.totalProducts || 0;
  const totalStock = inventoryData?.totalStock || 0;
  const lowStockCount = inventoryData?.lowStockCount || 0;
  const outOfStockCount = inventoryData?.outOfStockCount || 0;
  const lowStockTop = inventoryData?.lowStockTop || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng quan hoạt động bán hàng, tồn kho trong{" "}
            <span className="font-medium text-gray-800">
              {displayDays} ngày gần đây
            </span>
            .
          </p>
        </div>

        {/* NÚT EXPORT - Chỉ cần gọi exportFile từ hook */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              {isExporting ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Download size={14} />
              )}
              <span>Xuất dữ liệu</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {/* 1. Xuất Đơn hàng (truyền rangeDays để lọc đúng ngày) */}
              <button
                onClick={() => exportFile("orders", rangeDays)}
                disabled={isExporting}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-medium text-[11px] text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 transition-colors"
              >
                <Download size={12} />
                BC Đơn hàng
              </button>

              {/* 2. Xuất Sản phẩm */}
              <button
                onClick={() => exportFile("products")}
                disabled={isExporting}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-medium text-[11px] text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 transition-colors"
              >
                <Download size={12} />
                BC Tồn kho
              </button>

              {/* 3. Xuất Danh mục */}
              <button
                onClick={() => exportFile("categories")}
                disabled={isExporting}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-medium text-[11px] text-gray-700 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50 transition-colors"
              >
                <Download size={12} />
                Danh mục
              </button>

              {/* 4. Xuất Thương hiệu */}
              <button
                onClick={() => exportFile("brands")}
                disabled={isExporting}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-medium text-[11px] text-gray-700 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 transition-colors"
              >
                <Download size={12} />
                Thương hiệu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1) BÁO CÁO ĐƠN HÀNG & DOANH THU – biểu đồ Recharts */}
      <section>
        {/* Nếu muốn OrderStatsChart điều khiển rangeDays của toàn trang, bạn cần truyền setRangeDays vào component này. 
            Hiện tại OrderStatsChart của bạn đang có state riêng. Để đồng bộ tốt nhất,
            bạn nên chuyển state rangeDays từ component con ra component cha (ReportsPage).
            Nhưng để đơn giản, ta cứ giữ nguyên hiển thị. */}
        <OrderStatsChart />
      </section>

      {/* 2) LƯỚI: TỒN KHO + LOGISTICS / TRẠNG THÁI ĐƠN */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* 2.1. Báo cáo sản phẩm & tồn kho */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                Báo cáo sản phẩm & tồn kho
              </h2>
            </div>
            {inventoryLoading && (
              <span className="text-[11px] text-gray-400">
                Đang tải dữ liệu…
              </span>
            )}
          </div>

          {inventoryError ? (
            <p className="text-xs text-rose-500">
              Không tải được dữ liệu sản phẩm.
            </p>
          ) : (
            <>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-sky-50 to-sky-100/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-sky-600">
                    Tổng sản phẩm
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {totalProducts}
                  </div>
                  <div className="text-[11px] text-gray-500">Đang quản lý</div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-emerald-50 to-emerald-100/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-emerald-600">
                    Tổng tồn kho
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {totalStock.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Số lượng toàn bộ
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-amber-50 to-amber-100/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-amber-600">
                    Sắp hết (≤ 5)
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {lowStockCount}
                  </div>
                  <div className="text-[11px] text-gray-500">Cần nhập thêm</div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-rose-50 to-rose-100/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-rose-600">
                    Hết hàng (0)
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {outOfStockCount}
                  </div>
                  <div className="text-[11px] text-gray-500">Không thể bán</div>
                </div>
              </div>

              <InventoryStatsChart
                totalProducts={totalProducts}
                lowStockCount={lowStockCount}
                outOfStockCount={outOfStockCount}
              />

              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">
                    Top sản phẩm sắp hết hàng
                  </span>
                  {lowStockTop.length > 5 && (
                    <span className="text-[11px] text-gray-400">Top 5</span>
                  )}
                </div>

                {lowStockTop.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Tồn kho ổn định, chưa có sản phẩm báo động.
                  </p>
                ) : (
                  <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                    {lowStockTop.map((p) => (
                      <div
                        key={p._id || p.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-1.5 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Stock:{" "}
                            <span className="font-semibold text-amber-600">
                              {p.stock}
                            </span>
                          </p>
                        </div>
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          <AlertTriangle size={10} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 2.2. Báo cáo logistics / trạng thái đơn */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                Trạng thái đơn hàng
              </h2>
            </div>
            {statsLoading && (
              <span className="text-[11px] text-gray-400">
                Đang tính toán...
              </span>
            )}
          </div>

          {statsError ? (
            <p className="text-xs text-rose-500">
              Không tải được dữ liệu trạng thái đơn hàng.
            </p>
          ) : (
            <>
              <p className="mb-3 text-[11px] text-gray-500">
                Tổng hợp trạng thái trong{" "}
                <span className="font-semibold text-gray-800">
                  {displayDays} ngày gần nhất
                </span>
                .
              </p>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-slate-50 to-slate-100/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-600">
                    Tổng số đơn
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {orderStatusSummary.totalOrders}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Tất cả trạng thái
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-emerald-50 to-emerald-100/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-emerald-600">
                    Hoàn thành
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {orderStatusSummary.completed}{" "}
                    <span className="ml-1 text-xs text-emerald-600">
                      (
                      {formatPercent(
                        orderStatusSummary.completed,
                        orderStatusSummary.totalOrders
                      )}
                      )
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">Thành công</div>
                </div>
              </div>

              <OrderStatusSummaryChart
                summary={orderStatusSummary}
                days={displayDays}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
