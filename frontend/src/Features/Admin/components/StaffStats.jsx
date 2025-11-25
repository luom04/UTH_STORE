// src/Features/Admin/components/StaffStats.jsx
import { useMemo } from "react";
import { Users, Shield, DollarSign, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// --- Component Card con (Giữ nguyên) ---
function StatCard({ title, value, icon: Icon, color, subtext }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace("bg-", "text-")} />
        </div>
        {subtext && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} /> {subtext}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
          {title}
        </p>
      </div>
    </div>
  );
}

export default function StaffStats({ list = [], total = 0 }) {
  // 1. Tính toán số liệu
  const stats = useMemo(() => {
    const adminCount = list.filter(
      (u) => String(u.role).toLowerCase() === "admin"
    ).length;
    const staffCount = list.filter(
      (u) => String(u.role).toLowerCase() === "staff"
    ).length;
    const totalPayroll = list.reduce((sum, u) => sum + (u.salary || 0), 0);
    const activeCount = list.filter((u) => u.active).length;

    return {
      adminCount,
      staffCount,
      totalPayroll,
      activeCount,
    };
  }, [list]);

  // 2. Dữ liệu cho biểu đồ Recharts
  const chartData = [
    { name: "Quản trị viên", value: stats.adminCount, color: "#8b5cf6" }, // Purple
    { name: "Nhân viên", value: stats.staffCount, color: "#0ea5e9" }, // Sky Blue
  ];

  // Lọc bỏ data = 0 để biểu đồ không bị xấu
  const activeChartData = chartData.filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* CỘT TRÁI: Các thẻ số liệu (Chiếm 2 phần) */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Tổng nhân sự"
          value={total}
          icon={Users}
          color="bg-blue-500"
          subtext={`${stats.activeCount} đang hoạt động`}
        />
        <StatCard
          title="Quỹ lương (Trang này)"
          value={`${stats.totalPayroll.toLocaleString()}đ`}
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <StatCard
          title="Quản trị viên"
          value={stats.adminCount}
          icon={Shield}
          color="bg-purple-500"
        />
        <StatCard
          title="Nhân viên thường"
          value={stats.staffCount}
          icon={Users}
          color="bg-sky-500"
        />
      </div>

      {/* CỘT PHẢI: Biểu đồ tròn (Chiếm 1 phần) */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col items-center justify-center">
        <h4 className="text-sm font-semibold text-gray-700 w-full text-left mb-2 pl-2">
          Cơ cấu nhân sự
        </h4>

        {/* Recharts Container */}
        <div className="w-full h-[200px] text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeChartData}
                cx="50%"
                cy="50%"
                innerRadius={50} // Tạo lỗ ở giữa (Donut chart)
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {activeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} người`, "Số lượng"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chú thích thêm nếu data rỗng */}
        {activeChartData.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Chưa có dữ liệu để vẽ biểu đồ
          </p>
        )}
      </div>
    </div>
  );
}
