import { NavLink } from "react-router-dom";
import { User, MapPin, Package, LogOut } from "lucide-react";
import { PATHS } from "../../../routes/paths";
import { useCurrentUser } from "../../../hooks/useAuth"; // ⬅️ dùng hook có sẵn

const items = [
  { to: PATHS.PROFILE, icon: User, label: "Thông tin tài khoản" },
  { to: PATHS.ADDRESSES, icon: MapPin, label: "Sổ địa chỉ" },
  { to: PATHS.ACCOUNT_ORDERS, icon: Package, label: "Quản lý đơn hàng" },
  { to: PATHS.LOGOUT, icon: LogOut, label: "Đăng xuất" },
];

export default function AccountSidebar() {
  const { data: user, isLoading } = useCurrentUser();

  // display name + subline
  const displayName =
    (user && (user.name?.trim() || user.fullname?.trim())) ||
    (user && user.email) ||
    "Khách";

  const subline = user ? "Tài khoản của bạn" : "Chưa đăng nhập";

  // tạo initials cho avatar tròn nhỏ
  const initials = (displayName || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="grid size-12 place-items-center rounded-full bg-gray-100 text-gray-700 font-semibold">
          {/* Nếu muốn icon thay initials thì thay <span> bằng <User /> */}
          <span aria-hidden>{initials || <User size={20} />}</span>
        </div>

        <div className="min-w-0">
          <div className="font-semibold leading-tight truncate">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-gray-200 rounded w-32 h-4" />
            ) : (
              displayName
            )}
          </div>
          <div className="text-xs text-gray-500">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-gray-200 rounded w-24 h-3" />
            ) : (
              subline
            )}
          </div>
        </div>
      </div>

      <nav className="p-2">
        {items.map(({ to, icon: Icon, label, disabled }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                disabled
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-gray-50",
                isActive ? "bg-red-50 text-red-600" : "text-gray-700",
              ].join(" ")
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
