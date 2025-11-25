// src/Features/Admin/components/OrderStatusSummaryChart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const STATUS_META = [
  { key: "pending", label: "Chờ xác nhận", color: "#fbbf24" },
  { key: "confirmed", label: "Đã xác nhận", color: "#3b82f6" },
  { key: "shipping", label: "Đang vận chuyển", color: "#0ea5e9" },
  { key: "completed", label: "Hoàn thành", color: "#22c55e" },
  { key: "canceled", label: "Đã hủy", color: "#fb7185" },
];

export default function OrderStatusSummaryChart({ summary = {}, days = 30 }) {
  const total = summary.totalOrders || 0;

  const data = STATUS_META.map((s) => {
    const count = summary[s.key] || 0;
    const percent = total ? Math.round((count * 100) / total) : 0;
    return {
      key: s.key,
      label: s.label,
      count,
      percent,
      color: s.color,
    };
  }).filter((d) => d.count > 0 || total === 0); // nếu chưa có đơn thì vẽ trục rỗng

  if (!total) {
    return (
      <p className="mt-1 text-xs text-gray-500">
        Chưa có đơn hàng nào trong {days} ngày gần nhất để vẽ biểu đồ.
      </p>
    );
  }

  return (
    <div className="mt-3 h-56 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-800">
          Phân bố trạng thái đơn hàng
        </span>
        <span className="text-[11px] text-gray-500">
          Tổng: {total} đơn ({days} ngày)
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, _name, props) => {
              const v = Number(value || 0);
              const p = props.payload?.percent ?? 0;
              return [`${v} đơn (${p}%)`, "Số đơn"];
            }}
            labelFormatter={(label) => `Trạng thái: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="count" name="Số đơn" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
