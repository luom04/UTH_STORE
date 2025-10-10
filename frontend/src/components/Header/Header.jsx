import { Link } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

export default function Header() {
  return (
    <header className="border-b">
      {/* top bar đen */}
      <div className="bg-[#111111] text-white text-sm">
        <div className="max-w-6xl mx-auto px-3 h-9 flex items-center justify-between">
          <span>UTH Store — GEARVN style</span>
          <nav className="flex gap-4">
            <Link to="/help" className="hover:underline">
              Hỗ trợ
            </Link>
            <Link to="/stores" className="hover:underline">
              Hệ thống cửa hàng
            </Link>
          </nav>
        </div>
      </div>

      {/* middle bar: logo + search + actions */}
      <div className="max-w-6xl mx-auto px-3 h-16 flex items-center gap-4">
        <Link to="/" className="text-2xl font-bold text-[#e30019]">
          UTH_STORE
        </Link>
        <div className="flex-1">
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              className="w-full border rounded-lg h-10 px-4"
              placeholder="Bạn cần tìm gì hôm nay? (laptop, chuột, màn hình...)"
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm hover:text-[#e30019]">
            Đăng nhập
          </Link>
          <Link to="/cart" className="relative">
            <span aria-hidden>🛒</span>
            <span className="absolute -top-1 -right-2 bg-[#e30019] text-white text-xs rounded-full px-1">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* bottom bar: nav đỏ */}
      <NavBar />
    </header>
  );
}
