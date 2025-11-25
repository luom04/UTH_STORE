// src/Features/Admin/components/OrderStatsChart.jsx
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useAdminOrderStats } from "../../../hooks/useOrders.js";

const RANGES = [
  { value: 7, label: "7 ngày" },
  { value: 14, label: "14 ngày" },
  { value: 30, label: "30 ngày" },
];

function formatCurrency(n) {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " triệu";
  }
  return num.toLocaleString() + "đ";
}

// ✅ Parse "YYYY-MM-DD" an toàn, tránh lệch timezone
function formatShortDate(dateStr) {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-");
    const dd = new Date(Number(y), Number(m) - 1, Number(d));
    return dd.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function OrderStatsChart() {
  // 🆕 Đổi tên state để tránh trùng với props cũ
  const [rangeDays, setRangeDays] = useState(7);

  // Gọi hook thống kê
  const { data, isLoading, isError } = useAdminOrderStats(rangeDays);

  const buckets = data?.buckets || [];
  const summary = data?.summary || {};

  const chartData = useMemo(
    () =>
      buckets.map((b) => ({
        date: formatShortDate(b.date), // hiển thị dd/MM
        totalOrders: b.totalOrders || 0,
        revenue: b.revenue || 0,
        completed: b.completed || 0,
        canceled: b.canceled || 0,
      })),
    [buckets]
  );

  const totalOrders = summary.totalOrders || 0;
  const totalRevenue = summary.totalRevenue || 0;
  const completedRate = summary.completedRate || 0;
  const avgOrderValue = summary.avgOrderValue || 0;

  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Thống kê đơn hàng
          </h2>
          <p className="text-xs text-gray-500">
            Tổng quan đơn hàng & doanh thu trong {rangeDays} ngày gần nhất
          </p>
        </div>

        {/* Tabs chọn khoảng thời gian */}
        <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRangeDays(r.value)}
              className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                rangeDays === r.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-blue-50 to-blue-100/60 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase text-blue-600">
            Tổng đơn
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {totalOrders}
          </div>
          <div className="text-[11px] text-gray-500">
            Trong {rangeDays} ngày gần nhất
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-emerald-50 to-emerald-100/60 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase text-emerald-600">
            Doanh thu
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-gray-500">Tổng giá trị đơn hàng</div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-indigo-50 to-indigo-100/60 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase text-indigo-600">
            Đơn hoàn thành
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {Number.isFinite(completedRate)
              ? completedRate.toFixed(1)
              : completedRate}
            %
          </div>
          <div className="text-[11px] text-gray-500">
            Tỷ lệ đơn ở trạng thái “Hoàn thành”
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-amber-50 to-amber-100/60 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase text-amber-600">
            Giá trị trung bình
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {formatCurrency(avgOrderValue)}
          </div>
          <div className="text-[11px] text-gray-500">Mỗi đơn hàng (AOV)</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Đang tải biểu đồ…
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-rose-500">
            Không tải được dữ liệu thống kê.
          </div>
        ) : !chartData.length ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Chưa có đơn hàng trong khoảng thời gian này.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-gray-100"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr` : v
                }
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Doanh thu")
                    return [formatCurrency(value), name];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Cột: số đơn */}
              <Bar
                yAxisId="left"
                dataKey="totalOrders"
                name="Số đơn"
                radius={[4, 4, 0, 0]}
              />

              {/* Area: doanh thu */}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                dot={false}
                strokeWidth={2}
                fillOpacity={0.15}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
