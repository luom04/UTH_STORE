import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  Search,
  Headphones,
  MapPin,
  ClipboardList,
  ShoppingCart,
  UserCircle,
  UserCog,
} from "lucide-react";
import { PATHS, ADMIN_PATHS } from "../../routes/paths";
import { useAuth } from "../../contexts/AuthContext";

function getDisplayName(user) {
  if (!user) return "";
  const name =
    (user.name && user.name.trim()) ||
    (user.username && user.username.trim()) ||
    (user.email && user.email.split("@")[0]) ||
    "";
  return name;
}

export default function Header({ cartCount = 0, onMenuClick }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const role = String(user?.role || "").toLowerCase();
  const isStaffOrAdmin = role === "admin" || role === "nhanvien";

  const onSubmit = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    navigate(`${PATHS.SEARCH}?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="bg-[#e30019] text-white fixed top-0 left-0 right-0 p-3 z-50">
      <div className="max-w-6xl mx-auto px-3 h-14 flex items-center gap-3">
        <Link
          to="/"
          className="hidden sm:block text-xl font-extrabold tracking-wide transition-opacity duration-150 hover:opacity-90" // Thêm transition
        >
          <img src="/logo.png" alt="logo" className="h-15 w-30 object-center" />
        </Link>

        <button
          type="button"
          onClick={onMenuClick}
          // Thay hover:bg-[rgba(0,0,0,0.25)] -> hover:bg-[rgba(255,255,255,0.15)] (sáng lên)
          className="hidden sm:flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg h-10 px-3 transition-colors duration-150"
        >
          <Menu size={18} />
          <span className="font-medium">Danh mục</span>
        </button>

        {/* Ô tìm kiếm */}
        <form onSubmit={onSubmit} className="flex-1 max-w-md">
          <div className="relative h-10">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Bạn cần tìm gì?"
              className="w-full h-10 rounded-lg bg-white text-gray-700 placeholder-gray-500 pr-10 pl-3 outline-none"
            />
            <button
              type="submit"
              // Thêm transition-colors
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors duration-150"
              aria-label="Tìm kiếm"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* == KHỐI ACTIONS CHO ADMIN / NHÂN VIÊN == */}
        {isStaffOrAdmin && (
          <div className="hidden md:flex items-center gap-2 ml-2">
            {/* Thay hover:opacity-90 bằng hover:bg nền mờ + padding + bo tròn */}
            <Link
              to={PATHS.STORE_LOCATOR}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]"
            >
              <MapPin size={18} />
              <div className="leading-4">
                <div className="text-xs opacity-80">Hệ thống</div>
                <div className="text-sm font-semibold">Showroom</div>
              </div>
            </Link>

            <Link
              to={ADMIN_PATHS.ADMIN_DASHBOARD}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]"
            >
              <UserCog size={18} />
              <div className="leading-4">
                <div className="text-xs opacity-80">Trang</div>
                <div className="text-sm font-semibold">Quản trị</div>
              </div>
            </Link>

            {/* Thay hover:bg (tối) -> hover:bg (sáng) */}
            <Link
              to={PATHS.PROFILE}
              className="flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg h-10 px-3 transition-colors duration-150"
              title={getDisplayName(user)}
            >
              <UserCircle size={18} />
              <div className="text-left leading-4">
                <div className="text-xs opacity-80">Xin chào</div>
                <div className="text-sm font-semibold max-w-[160px] truncate">
                  {getDisplayName(user)}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* == KHỐI ACTIONS CHO KHÁCH HÀNG (MẶC ĐỊNH) == */}
        {!isStaffOrAdmin && (
          // Giảm gap-5 -> gap-2 để bù cho padding mới
          <div className="hidden md:flex items-center gap-2 ml-2">
            {/* Thay hover:opacity-90 bằng hover:bg nền mờ + padding + bo tròn */}
            <Link
              to="/hotline"
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]"
            >
              <Headphones size={18} />
              <div className="leading-4">
                <div className="text-xs opacity-80">Hotline</div>
                <div className="text-sm font-semibold">1900.5301</div>
              </div>
            </Link>

            <Link
              to={PATHS.STORE_LOCATOR}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]"
            >
              <MapPin size={18} />
              <div className="leading-4">
                <div className="text-xs opacity-80">Hệ thống</div>
                <div className="text-sm font-semibold">Showroom</div>
              </div>
            </Link>

            <Link
              to={PATHS.ACCOUNT_ORDERS}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]"
            >
              <ClipboardList size={18} />
              <div className="leading-4">
                <div className="text-xs opacity-80">Tra cứu</div>
                <div className="text-sm font-semibold">đơn hàng</div>
              </div>
            </Link>

            <Link
              to={PATHS.CART}
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]"
            >
              <ShoppingCart size={18} />
              <div className="leading-4">
                <div className="text-sm font-semibold">Giỏ hàng</div>
              </div>
              <span className="absolute -top-1 -right-2 bg-yellow-300 text-black text-[10px] font-bold rounded-full w-4 h-4 grid place-items-center">
                {cartCount}
              </span>
            </Link>

            {/* User block (Đăng nhập / Xin chào) */}
            {!isAuthenticated ? (
              // Thay hover:bg (tối) -> hover:bg (sáng)
              <Link
                to={PATHS.LOGIN}
                className="flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg h-10 px-3 transition-colors duration-150"
              >
                <UserCircle size={18} />
                <span className="font-medium">Đăng nhập</span>
              </Link>
            ) : (
              // Thay hover:bg (tối) -> hover:bg (sáng)
              <Link
                to={PATHS.PROFILE}
                className="flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg h-10 px-3 transition-colors duration-150"
                title={getDisplayName(user)}
              >
                <UserCircle size={18} />
                <div className="text-left leading-4">
                  <div className="text-xs opacity-80">Xin chào</div>
                  <div className="text-sm font-semibold max-w-[160px] truncate">
                    {getDisplayName(user)}
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
