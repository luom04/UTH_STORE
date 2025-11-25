import { useAuth } from "../../../contexts/AuthContext";
import { useDashboardStats } from "../../../hooks/useDashboard";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  // ✅ Import các icon mới tương ứng với menu
  ShoppingBag, // Đơn hàng
  Package, // Sản phẩm
  MessageSquare, // Đánh giá
  UserCog, // Nhân viên
  BarChart2, // Báo cáo
  Rocket, // Icon tiêu đề
} from "lucide-react";

import DashboardChart from "../components/DashboardChart";

// --- Component: Stat Card (Giữ nguyên) ---
function StatCard({ title, value, icon: Icon, color, subtext, subtextColor }) {
  return (
    <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
      {subtext && (
        <div className="mt-3 flex items-center text-xs">
          <span className={`font-medium ${subtextColor} mr-1`}>{subtext}</span>
        </div>
      )}
    </div>
  );
}

// --- Component: Recent Orders Table (Giữ nguyên) ---
function RecentOrdersTable({ orders = [] }) {
  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    confirmed: "bg-blue-50 text-blue-700 border-blue-100",
    shipping: "bg-indigo-50 text-indigo-700 border-indigo-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    canceled: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Đơn hàng mới nhất</h3>
        <Link
          to="/admin/orders"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        >
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Khách hàng</th>
              <th className="px-5 py-3">Tổng tiền</th>
              <th className="px-5 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-gray-900">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {order.user?.name || "Khách lẻ"}
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {order.grandTotal?.toLocaleString()}đ
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs border ${
                      statusColors[order.status] || "bg-gray-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  Chưa có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Helper Component: Quick Link Button ---
// Giúp code gọn hơn, không lặp lại class
function QuickLink({
  to,
  icon: Icon,
  label,
  colorClass = "hover:text-blue-600 hover:bg-blue-50",
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 ${colorClass}`}
    >
      <Icon size={24} />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}

// --- MAIN DASHBOARD PAGE ---
export default function DashboardAdmin() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );

  if (isError)
    return (
      <div className="text-red-500 text-center py-10">
        Không tải được dữ liệu Dashboard.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chào mừng trở lại,{" "}
            <span className="font-semibold text-gray-800">{user?.name}</span>!
          </p>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Doanh thu hôm nay"
          value={`${data?.revenue?.today?.toLocaleString()}đ`}
          icon={DollarSign}
          color="bg-emerald-500 text-emerald-600"
          subtext="Doanh thu thực tế"
          subtextColor="text-emerald-600"
        />

        <StatCard
          title="Đơn chờ xử lý"
          value={data?.orders?.pending}
          icon={Clock}
          color="bg-amber-500 text-amber-600"
          subtext="Cần xử lý gấp"
          subtextColor="text-amber-600"
        />

        <StatCard
          title="Tổng khách hàng"
          value={data?.customers?.total}
          icon={Users}
          color="bg-blue-500 text-blue-600"
        />

        <StatCard
          title="Sắp hết hàng"
          value={data?.products?.lowStock}
          icon={AlertCircle}
          color="bg-rose-500 text-rose-600"
          subtext="Tồn kho ≤ 5"
          subtextColor="text-rose-600"
        />
      </div>

      {/* 3. Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardChart data={data?.chart} />
        </div>
        <div className="lg:col-span-1">
          <RecentOrdersTable orders={data?.recentOrders} />
        </div>
      </div>

      {/* 4. Quick Actions & Notes (ĐÃ CẬP NHẬT THEO HÌNH) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ Truy cập nhanh - 6 Nút */}
        <div className="md:col-span-2 rounded-xl bg-white p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Rocket size={18} className="text-indigo-600" /> Truy cập nhanh
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* 1. Quản lý đơn hàng */}
            <QuickLink
              to="/admin/orders"
              icon={ShoppingBag}
              label="Đơn hàng"
              colorClass="hover:text-blue-600 hover:bg-blue-50"
            />

            {/* 2. Quản lý sản phẩm */}
            <QuickLink
              to="/admin/products"
              icon={Package}
              label="Sản phẩm"
              colorClass="hover:text-indigo-600 hover:bg-indigo-50"
            />

            {/* 3. Quản lý đánh giá */}
            <QuickLink
              to="/admin/reviews"
              icon={MessageSquare}
              label="Đánh giá"
              colorClass="hover:text-amber-600 hover:bg-amber-50"
            />

            {/* 4. Quản lý khách hàng */}
            <QuickLink
              to="/admin/customers"
              icon={Users}
              label="Khách hàng"
              colorClass="hover:text-emerald-600 hover:bg-emerald-50"
            />

            {/* 5. Quản lý nhân viên (Chỉ Admin) */}
            {isAdmin ? (
              <QuickLink
                to="/admin/staffs"
                icon={UserCog}
                label="Nhân viên"
                colorClass="hover:text-purple-600 hover:bg-purple-50"
              />
            ) : (
              // Placeholder nếu không phải admin để lưới đẹp (hoặc ẩn đi tùy bạn)
              <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 opacity-50 cursor-not-allowed">
                <UserCog size={24} />
                <span className="text-sm font-medium text-gray-500">
                  Nhân viên
                </span>
              </div>
            )}

            {/* 6. Quản lý báo cáo */}
            <QuickLink
              to="/admin/reports"
              icon={BarChart2}
              label="Báo cáo"
              colorClass="hover:text-rose-600 hover:bg-rose-50"
            />
          </div>
        </div>

        {/* Note Box */}
        <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-2">Ghi chú hệ thống</h3>
          <textarea
            className="w-full flex-1 min-h-[120px] rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:outline-none resize-none bg-gray-50"
            placeholder="Nhập ghi chú cho ca làm việc tiếp theo..."
          />
        </div>
      </div>
    </div>
  );
}
