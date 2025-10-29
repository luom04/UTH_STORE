// src/Features/Admin/DashboardAdmin
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { ADMIN_PATHS } from "../../../routes/paths";

// StatCard đơn giản
function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-xl bg-white border shadow-sm p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-400">{hint}</div> : null}
    </div>
  );
}

// Bảng đơn hàng gần đây (mock)
function RecentOrders() {
  const rows = [
    {
      id: "DH1001",
      customer: "Nguyễn Văn A",
      total: 2990000,
      status: "Đang xử lý",
    },
    {
      id: "DH1000",
      customer: "Trần Thị B",
      total: 1590000,
      status: "Chờ xác nhận",
    },
    { id: "DH0999", customer: "Phạm C", total: 7490000, status: "Đang giao" },
  ];

  return (
    <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="font-semibold">Đơn hàng gần đây</div>
        <Link
          to={ADMIN_PATHS.ADMIN_ORDERS}
          className="text-sm text-blue-600 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Mã đơn</th>
              <th className="text-left px-4 py-2">Khách hàng</th>
              <th className="text-left px-4 py-2">Tổng tiền</th>
              <th className="text-left px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2 font-medium">
                  <Link
                    to={`/admin/orders/${r.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {r.id}
                  </Link>
                </td>
                <td className="px-4 py-2">{r.customer}</td>
                <td className="px-4 py-2">{r.total.toLocaleString()}đ</td>
                <td className="px-4 py-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Khối quản trị nhân viên
function StaffManagementShortcut() {
  return (
    <div className="rounded-xl bg-white border shadow-sm p-4">
      <div className="font-semibold mb-1">Quản lý nhân viên</div>
      <p className="text-sm text-gray-600">
        Thêm/sửa quyền nhân viên, kích hoạt/tạm khoá tài khoản.
      </p>
      <Link
        to="/admin/staffs"
        className="inline-block mt-3 rounded-lg bg-red-600 text-white px-4 py-2 text-sm"
      >
        Vào trang quản lý
      </Link>
    </div>
  );
}

export default function DashboardAdmin() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  // mock KPI — sau thay bằng React Query
  const kpis = {
    revenueToday: 53290000,
    ordersNew: 12,
    ordersProcessing: 7,
    productsLowStock: 4,
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-xl font-bold">Bảng điều khiển</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xin chào, {user?.name || "Admin"}. Vai trò:{" "}
          <b>{role.toUpperCase()}</b>
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Doanh thu hôm nay"
          value={`${kpis.revenueToday.toLocaleString()}đ`}
          hint="Cập nhật mỗi 15 phút"
        />
        <StatCard title="Đơn hàng mới" value={kpis.ordersNew} />
        <StatCard title="Đang xử lý" value={kpis.ordersProcessing} />
        <StatCard title="Sắp hết hàng" value={kpis.productsLowStock} />
      </div>

      {/* shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border shadow-sm p-4">
          <div className="font-semibold">Tác vụ nhanh</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Link
              to={ADMIN_PATHS.ADMIN_ORDERS}
              className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            >
              Xem đơn hàng
            </Link>
            <Link
              to={ADMIN_PATHS.ADMIN_PRODUCTS}
              className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            >
              Quản lý sản phẩm
            </Link>
            <Link
              to={ADMIN_PATHS.ADMIN_CUSTOMERS}
              className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            >
              Khách hàng
            </Link>

            {/* SỬA 1: Chỉ admin mới thấy link "Nhân viên" */}
            {isAdmin && (
              <Link
                to="/admin/staffs"
                className="rounded-lg border px-3 py-2 hover:bg-gray-50"
              >
                Nhân viên
              </Link>
            )}
          </div>
        </div>

        {/* SỬA 2: Chỉ admin mới thấy component "StaffManagementShortcut" */}
        {isAdmin && <StaffManagementShortcut />}

        <div className="rounded-xl bg-white border shadow-sm p-4">
          <div className="font-semibold">Ghi chú nội bộ</div>
          <textarea
            className="w-full mt-2 rounded-lg border px-3 py-2"
            rows={5}
            placeholder="Ghi chú nhanh cho ca làm việc..."
          />
        </div>
      </div>

      {/* recent orders */}
      <RecentOrders />
    </div>
  );
}
