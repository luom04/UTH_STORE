import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  Search,
  Headphones,
  MapPin,
  ClipboardList,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { PATHS } from "../../routes/paths";
/**
 * Header đỏ kiểu GEARVN (dùng lucide-react)
 * - props.cartCount: số lượng item trong giỏ (mặc định 0)
 */
export default function Header({ cartCount = 0, onMenuClick }) {
  const [q, setQ] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: điều hướng đến trang tìm kiếm, ví dụ: navigate(`/search?q=${encodeURIComponent(q)}`)
    console.log("search:", q);
  };

  return (
    // 👇 THÊM CÁC CLASS CỐ ĐỊNH VÀO ĐÂY
    <div className="bg-[#e30019] text-white fixed top-0 left-0 right-0 p-3 z-50">
      <div className="max-w-6xl mx-auto px-3 h-14 flex items-center gap-3">
        {/* Logo nếu muốn đặt ở đây (tuỳ bố cục của bạn) */}
        <Link
          to="/"
          className="hidden sm:block text-xl font-extrabold tracking-wide"
        >
          UTH_STORE
        </Link>

        {/* Nút Danh mục */}
        <button
          type="button"
          onClick={onMenuClick} // <-- Gọi hàm khi click
          className="hidden sm:flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.25)] rounded-lg h-10 px-3 transition-colors cursor-pointer"
        >
          <Menu size={18} />
          <span className="font-medium">Danh mục</span>
        </button>

        {/* Ô tìm kiếm lớn */}
        <form onSubmit={onSubmit} className="flex-1">
          <div className="relative h-10">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Bạn cần tìm gì?"
              className="w-full h-10 rounded-lg bg-white text-gray-700 placeholder-gray-500 pr-10 pl-3 outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              aria-label="Tìm kiếm"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-5 ml-2">
          <Link
            to="/hotline"
            className="flex items-center gap-2 hover:opacity-90"
          >
            <Headphones size={18} />
            <div className="leading-4">
              <div className="text-xs opacity-80">Hotline</div>
              <div className="text-sm font-semibold">1900.5301</div>
            </div>
          </Link>

          <Link
            to="/stores"
            className="flex items-center gap-2 hover:opacity-90"
          >
            <MapPin size={18} />
            <div className="leading-4">
              <div className="text-xs opacity-80">Hệ thống</div>
              <div className="text-sm font-semibold">Showroom</div>
            </div>
          </Link>

          <Link
            to="/order-tracking"
            className="flex items-center gap-2 hover:opacity-90"
          >
            <ClipboardList size={18} />
            <div className="leading-4">
              <div className="text-xs opacity-80">Tra cứu</div>
              <div className="text-sm font-semibold">đơn hàng</div>
            </div>
          </Link>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 hover:opacity-90"
          >
            <ShoppingCart size={18} />
            <div className="leading-4">
              <div className="text-sm font-semibold">Giỏ hàng</div>
            </div>
            {/* badge */}
            <span className="absolute -top-1 -right-2 bg-yellow-300 text-black text-[10px] font-bold rounded-full w-4 h-4 grid place-items-center">
              {cartCount}
            </span>
          </Link>

          <Link
            to={PATHS.LOGIN}
            className="flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.25)] rounded-lg h-10 px-3 transition-colors"
          >
            <UserCircle size={18} />
            <span className="font-medium">Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
