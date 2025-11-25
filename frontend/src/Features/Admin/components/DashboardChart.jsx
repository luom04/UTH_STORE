import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardChart({ data = [] }) {
  // Map dữ liệu từ BE (nếu cần format lại ngày tháng)
  // Giả sử BE trả về: { _id: "2024-11-20", revenue: 5000000 }
  const chartData = data.map((d) => ({
    name: d._id.split("-").slice(1).join("/"), // Chuyển 2024-11-20 -> 11/20
    revenue: d.revenue,
  }));

  return (
    <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Doanh thu 7 ngày qua
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Real-time
        </span>
      </div>

      <div className="h-[300px] w-full text-xs">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) =>
                  value >= 1000000 ? `${value / 1000000}M` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [
                  `${value.toLocaleString()}đ`,
                  "Doanh thu",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Chưa có dữ liệu doanh thu tuần này
          </div>
        )}
      </div>
    </div>
  );
}
