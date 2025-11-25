import { Users, UserPlus, UserX, ShieldCheck } from "lucide-react";
import { useCustomerStats } from "../../../hooks/useCustomers";

function StatCard({ title, value, icon: Icon, color, loading }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {loading ? "..." : value?.toLocaleString()}
          </div>
        </div>
        <div className={`rounded-full p-2 ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function CustomerStatsCards() {
  const { data: stats, isLoading } = useCustomerStats();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
      <StatCard
        title="Tổng khách hàng"
        value={stats?.totalCustomers || 0}
        icon={Users}
        color="bg-blue-500"
        loading={isLoading}
      />
      <StatCard
        title="Khách mới (tháng này)"
        value={stats?.newCustomers || 0}
        icon={UserPlus}
        color="bg-emerald-500"
        loading={isLoading}
      />
      <StatCard
        title="Đang hoạt động"
        value={stats?.activeCustomers || 0}
        icon={ShieldCheck}
        color="bg-indigo-500"
        loading={isLoading}
      />
      <StatCard
        title="Đã bị chặn"
        value={stats?.blockedCustomers || 0}
        icon={UserX}
        color="bg-rose-500"
        loading={isLoading}
      />
    </div>
  );
}
