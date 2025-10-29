import { Link, useLocation } from "react-router-dom";
import { ADMIN_PATHS } from "../../../routes/paths";
import { useAuth } from "../../../contexts/AuthContext";
// 1. Import các icons từ lucide-react
import { LayoutDashboard, Package, Box, Users, UserCog } from "lucide-react";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  // 2. Thêm icon và cờ 'adminOnly' vào mảng menu
  const menu = [
    {
      label: "Tổng quan",
      to: ADMIN_PATHS.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Quản lý đơn hàng",
      to: ADMIN_PATHS.ADMIN_ORDERS,
      icon: Package,
    },
    {
      label: "Quản lý sản phẩm",
      to: ADMIN_PATHS.ADMIN_PRODUCTS,
      icon: Box,
    },
    {
      label: "Quản lý khách hàng",
      to: ADMIN_PATHS.ADMIN_CUSTOMERS,
      icon: Users,
    },
    {
      label: "Quản lý nhân viên",
      to: ADMIN_PATHS.ADMIN_STAFFS,
      icon: UserCog,
      adminOnly: true, // Chỉ admin mới thấy
    },
  ];

  return (
    <nav className="rounded-xl bg-white border shadow-sm p-3">
      {/* 3. Tinh chỉnh tiêu đề (thêm uppercase) */}
      <div className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase tracking-wider">
        Menu quản trị
      </div>

      <ul className="space-y-1">
        {menu.map((m) => {
          // 4. Áp dụng logic ẩn mục "Quản lý nhân viên"
          if (m.adminOnly && !isAdmin) {
            return null;
          }

          const active = pathname === m.to;
          const Icon = m.icon; // Lấy component Icon từ mảng

          return (
            <li key={m.to}>
              <Link
                to={m.to}
                // 5. Cập nhật Tailwind class
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-red-600 text-white"
                    : "text-gray-800 hover:bg-red-50 hover:text-red-600",
                ].join(" ")}
              >
                <Icon size={20} /> {/* Render Icon */}
                <span>{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
