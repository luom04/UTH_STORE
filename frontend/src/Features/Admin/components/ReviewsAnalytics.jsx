// src/Features/Admin/components/ReviewsAnalytics.jsx
import { Star } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

/**
 * Hiển thị:
 * - Bên trái: Top sản phẩm được đánh giá (top 5, có scroll nếu nhiều)
 * - Bên phải: 2 biểu đồ
 *    + BarChart: phân bố đánh giá theo số sao
 *    + LineChart: số lượng đánh giá theo ngày
 *
 * Props:
 *  - productStats: [{ productId, title, thumb, reviewCount, avgRating }]
 *  - ratingChartData: [{ star: '5★', count }]
 *  - timeChartData: [{ dateKey, dateLabel, count }]
 *  - daysLabel: string, ví dụ: "14 ngày gần đây"
 */
export default function ReviewsAnalytics({
  productStats = [],
  ratingChartData = [],
  timeChartData = [],
  daysLabel,
}) {
  const daysLabelLower = daysLabel
    ? daysLabel.toLowerCase()
    : "khoảng thời gian đã chọn";

  const hasAnyData =
    productStats.length > 0 ||
    ratingChartData.some((d) => d.count > 0) ||
    timeChartData.some((d) => d.count > 0);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)]">
      {/* TOP SẢN PHẨM */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Sản phẩm được đánh giá nhiều
          </h2>
          {productStats.length > 5 && (
            <span className="text-[11px] text-gray-400">
              Hiển thị top 5 trong {productStats.length} sản phẩm
            </span>
          )}
        </div>

        {productStats.length === 0 ? (
          <p className="text-xs text-gray-500">
            Chưa có dữ liệu đánh giá trong {daysLabelLower}.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {productStats.slice(0, 5).map((p) => (
              <div
                key={p.productId}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
              >
                {p.thumb ? (
                  <img
                    src={p.thumb}
                    alt={p.title}
                    className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-200 text-[11px] text-gray-500">
                    N/A
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-900">
                    {p.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-600">
                    <span>{p.reviewCount} đánh giá</span>
                    <span className="h-1 w-px bg-gray-300" />
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="text-yellow-400" />
                      {p.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BIỂU ĐỒ */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Biểu đồ đánh giá theo sao & theo ngày
          </h2>
          <span className="text-[11px] text-gray-400">{daysLabel}</span>
        </div>

        {!hasAnyData ? (
          <p className="text-xs text-gray-500">
            Chưa có dữ liệu để vẽ biểu đồ trong {daysLabelLower}.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Bar: phân bố số sao */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingChartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="star" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [`${value} đánh giá`, "Số lượng"]}
                    labelFormatter={(label) => `Số sao: ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line: số đánh giá theo ngày */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeChartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [`${value} đánh giá`, "Số đánh giá"]}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
