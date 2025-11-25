// src/Features/Admin/components/InventoryStatsChart.jsx
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  out: "#f97373", // hết hàng
  low: "#fbbf24", // sắp hết
  normal: "#22c55e", // còn hàng
};

function formatLabel(name, value, total) {
  if (!total) return `${name}: 0`;
  const percent = Math.round((value * 100) / total);
  return `${name}: ${value} (${percent}%)`;
}

export default function InventoryStatsChart({
  totalProducts = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
}) {
  const normalCount = Math.max(
    totalProducts - (lowStockCount + outOfStockCount),
    0
  );

  const data = [
    { key: "out", name: "Hết hàng", value: outOfStockCount },
    { key: "low", name: "Sắp hết (≤ 5)", value: lowStockCount },
    { key: "normal", name: "Còn hàng", value: normalCount },
  ].filter((d) => d.value > 0);

  const totalForPercent = data.reduce((sum, d) => sum + d.value, 0);

  if (!totalProducts) {
    return (
      <p className="text-xs text-gray-500">
        Chưa có dữ liệu sản phẩm để vẽ biểu đồ tồn kho.
      </p>
    );
  }

  if (!data.length) {
    return (
      <p className="text-xs text-gray-500">
        Tất cả sản phẩm hiện đang có tồn kho bình thường.
      </p>
    );
  }

  return (
    <div className="mt-3 h-56 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-800">
          Phân bố sản phẩm theo tình trạng tồn kho
        </span>
        <span className="text-[11px] text-gray-500">
          Tổng: {totalProducts} sản phẩm
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={70}
            innerRadius={30}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={STATUS_COLORS[entry.key] || "#9ca3af"}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, props) => {
              const v = Number(value || 0);
              const percent = totalForPercent
                ? Math.round((v * 100) / totalForPercent)
                : 0;
              return [`${v} sản phẩm (${percent}%)`, props.payload.name];
            }}
          />
          <Legend
            formatter={(value, _entry, idx) =>
              formatLabel(
                data[idx]?.name || value,
                data[idx]?.value || 0,
                totalForPercent
              )
            }
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
