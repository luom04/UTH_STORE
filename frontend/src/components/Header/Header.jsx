import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  MapPin,
  ClipboardList,
  ShoppingCart,
  UserCircle,
  UserCog,
} from "lucide-react";
import { PATHS, ADMIN_PATHS } from "../../routes/paths";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchSuggest } from "../../hooks/useProductsPublic";
import { useCart } from "../../hooks/useCart";

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */
function getDisplayName(user) {
  if (!user) return "";
  const name =
    (user.name && user.name.trim()) ||
    (user.username && user.username.trim()) ||
    (user.email && user.email.split("@")[0]) ||
    "";
  return name;
}

// Helper định dạng tiền tệ
const formatCurrency = (value) => {
  if (typeof value !== "number") return "";
  return value.toLocaleString("vi-VN") + "đ";
};

// ✅ Cập nhật: Không tô vàng nền nữa, chỉ in đậm chữ khớp
function highlight(text = "", q = "") {
  if (!q) return text;
  const tokens = q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // escape regex
  if (!tokens.length) return text;
  const re = new RegExp(`(${tokens.join("|")})`, "ig");
  const parts = String(text).split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      // Thay đổi class ở đây: font-bold text-gray-900 thay vì bg-yellow-200
      <span key={i} className="font-bold text-gray-900">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ✅ Cập nhật: Hiển thị giá bán và giá gốc gạch ngang
function SuggestItem({ item, active, query, onClick }) {
  const hasDiscount = item.priceSale && item.priceSale < item.price;
  const currentPrice = hasDiscount ? item.priceSale : item.price;

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        // ✅ Base classes: Transition mượt, bo góc
        "w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200 rounded-lg group " +
        "cursor-pointer " + // ✅ Hiệu ứng bàn tay
        (active
          ? "bg-gray-100 shadow-md scale-[1.02] z-10 relative" // State khi dùng bàn phím
          : "hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] hover:z-10 hover:relative") // ✅ State khi hover chuột: Nổi lên & Phóng to nhẹ
      }
    >
      {/* Ảnh sản phẩm */}
      <div className="h-12 w-12 rounded border bg-white overflow-hidden shrink-0 grid place-items-center transition-transform group-hover:border-gray-300">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-[10px] text-gray-400">no img</div>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 line-clamp-1 group-hover:text-blue-700 transition-colors">
          {/* Thêm group-hover:text-blue-700 để tiêu đề đổi màu khi hover */}
          {highlight(item.title, query)}
        </div>
        <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
          {(item.brand || item.category) && (
            <>
              {item.brand ? `${item.brand} · ` : ""}
              {item.category || ""}
            </>
          )}
        </div>
      </div>

      {/* Giá */}
      <div className="ml-2 flex flex-col items-end shrink-0">
        <span className="text-[13px] font-bold text-red-600">
          {formatCurrency(currentPrice)}
        </span>
        {hasDiscount && (
          <span className="text-[11px] text-gray-400 line-through">
            {formatCurrency(item.price)}
          </span>
        )}
      </div>
    </button>
  );
}

/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */
export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isStaffOrAdmin = role === "admin" || role === "staff";

  // Lấy giỏ hàng từ API
  const { cart } = useCart();
  const cartCount = cart?.itemCount ?? 0;

  // Search state
  const [q, setQ] = useState("");
  // ✅ Thêm state cho debounce query
  const [debouncedQ, setDebouncedQ] = useState("");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const popRef = useRef(null);

  // ✅ Xử lý Debounce: Chỉ cập nhật debouncedQ sau khi người dùng ngừng gõ 500ms
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQ(q);
    }, 500); // Delay 500ms

    // Cleanup function để clear timeout nếu q thay đổi trước khi hết 500ms
    return () => clearTimeout(timerId);
  }, [q]);

  // ✅ Gọi API suggest dựa trên debouncedQ (thay vì q trực tiếp)
  const { data: items = [], isFetching } = useSearchSuggest(debouncedQ, {
    limit: 6,
    // Chỉ gọi API khi debouncedQ có giá trị
    enabled: open && debouncedQ.trim().length > 0,
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function onDocClick(e) {
      if (!popRef.current) return;
      if (
        popRef.current.contains(e.target) ||
        inputRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
      setActive(-1);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Xử lý bàn phím
  const onKeyDown = (e) => {
    if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, (items?.length || 0) - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) {
        navigate(`/products/${items[active].id}`);
        setOpen(false);
        setActive(-1);
      } else if (q.trim()) {
        navigate(`${PATHS.SEARCH}?q=${encodeURIComponent(q.trim())}`);
        setOpen(false);
        setActive(-1);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    navigate(`${PATHS.SEARCH}?q=${encodeURIComponent(keyword)}`);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="bg-[#e30019] text-white fixed top-0 left-0 right-0 p-3 z-50">
      <div className="max-w-6xl mx-auto px-3 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link
          to={PATHS.HOME}
          className="hidden sm:block text-xl font-extrabold tracking-wide transition-opacity duration-150 hover:opacity-90"
        >
          <img src="/logo.png" alt="logo" className="h-15 w-30 object-center" />
        </Link>

        {/* Nút menu danh mục */}
        <button
          type="button"
          onClick={onMenuClick}
          className="hidden sm:flex items-center gap-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] rounded-lg h-10 px-3 transition-all duration-200"
        >
          <Menu size={18} className="font-bold" />
          <span className="font-semibold">Danh mục</span>
        </button>

        {/* Ô tìm kiếm + dropdown suggest */}
        <div className="relative flex-1 max-w-md">
          <form onSubmit={onSubmit}>
            <div className="relative h-10">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setOpen(true);
                  setActive(-1);
                }}
                onFocus={() => q && setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="Bạn cần tìm gì?"
                className="w-full h-10 rounded-lg bg-white text-gray-700 placeholder-gray-500 pr-10 pl-3 outline-none"
                aria-expanded={open}
                aria-activedescendant={
                  active >= 0 && items[active]
                    ? `sugg-${items[active].id}`
                    : undefined
                }
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors duration-150"
                aria-label="Tìm kiếm"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Dropdown Results */}
          {open && (
            <div
              ref={popRef}
              className="absolute left-0 right-0 mt-2 rounded-xl bg-white text-gray-800 shadow-xl border border-gray-100 overflow-hidden z-[60] p-2"
            >
              {isFetching ? (
                <div className="p-3 text-sm text-gray-500 flex items-center justify-center gap-2">
                  <span>Đang tìm...</span>
                </div>
              ) : items.length > 0 ? (
                <div
                  role="listbox"
                  aria-label="Gợi ý tìm kiếm"
                  className="space-y-1"
                >
                  {items.map((it, idx) => (
                    <div
                      id={`sugg-${it.id}`}
                      key={it.id}
                      role="option"
                      aria-selected={active === idx}
                    >
                      <SuggestItem
                        item={it}
                        active={active === idx}
                        query={q}
                        onClick={() => {
                          navigate(`/products/${it.id}`);
                          setOpen(false);
                          setActive(-1);
                        }}
                      />
                    </div>
                  ))}
                  {/* Nút Xem tất cả */}
                  <div className="border-t mt-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!q.trim()) return;
                        navigate(
                          `${PATHS.SEARCH}?q=${encodeURIComponent(q.trim())}`
                        );
                        setOpen(false);
                        setActive(-1);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-sm text-center hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors cursor-pointer font-medium"
                    >
                      Xem tất cả kết quả cho "
                      <span className="font-bold text-red-600">{q}</span>"
                    </button>
                  </div>
                </div>
              ) : q.trim() ? (
                <div className="px-4 py-3 text-sm text-gray-600 text-center">
                  Không tìm thấy sản phẩm nào...
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* === ACTIONS: ADMIN / STAFF === */}
        {isStaffOrAdmin && (
          <div className="hidden md:flex items-center gap-2 ml-2">
            <Link
              to={PATHS.STORE_LOCATOR}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.2)]"
            >
              <MapPin size={18} className="font-bold" />
              <div className="leading-4">
                <div className="text-xs font-medium">Hệ thống</div>
                <div className="text-sm font-bold">Showroom</div>
              </div>
            </Link>

            <Link
              to={ADMIN_PATHS.ADMIN_DASHBOARD}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 border border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.2)]"
            >
              <UserCog size={18} className="font-bold" />
              <div className="leading-4">
                <div className="text-xs font-medium">Trang</div>
                <div className="text-sm font-bold">Quản trị</div>
              </div>
            </Link>

            <Link
              to={PATHS.PROFILE}
              className="flex items-center gap-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] rounded-lg h-10 px-3 transition-all duration-200"
              title={getDisplayName(user)}
            >
              <UserCircle size={18} className="font-bold" />
              <div className="text-left leading-4">
                <div className="text-xs font-medium">Xin chào</div>
                <div className="text-sm font-bold max-w-[160px] truncate">
                  {getDisplayName(user)}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* === ACTIONS: KHÁCH === */}
        {!isStaffOrAdmin && (
          <div className="hidden md:flex items-center gap-2 ml-2">
            <Link
              to={PATHS.STORE_LOCATOR}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.2)]"
            >
              <MapPin size={18} className="font-bold" />
              <div className="leading-4">
                <div className="text-xs font-medium">Hệ thống</div>
                <div className="text-sm font-bold">Showroom</div>
              </div>
            </Link>

            <Link
              to={PATHS.ACCOUNT_ORDERS}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.2)]"
            >
              <ClipboardList size={18} className="font-bold" />
              <div className="leading-4">
                <div className="text-xs font-medium">Tra cứu</div>
                <div className="text-sm font-bold">đơn hàng</div>
              </div>
            </Link>

            <Link
              to={PATHS.CART}
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.2)]"
            >
              <ShoppingCart size={18} className="font-bold" />
              <div className="leading-4">
                <div className="text-sm font-bold">Giỏ hàng</div>
              </div>

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-yellow-300 text-black text-[10px] font-bold rounded-full min-w-4 h-4 px-[2px] grid place-items-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {!isAuthenticated ? (
              <Link
                to={PATHS.LOGIN}
                className="flex items-center gap-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] rounded-lg h-10 px-3 transition-all duration-200"
              >
                <UserCircle size={18} className="font-bold" />
                <span className="font-semibold">Đăng nhập</span>
              </Link>
            ) : (
              <Link
                to={PATHS.PROFILE}
                className="flex items-center gap-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] rounded-lg h-10 px-3 transition-all duration-200"
                title={getDisplayName(user)}
              >
                <UserCircle size={18} className="font-bold" />
                <div className="text-left leading-4">
                  <div className="text-xs font-medium">Xin chào</div>
                  <div className="text-sm font-bold max-w-[160px] truncate">
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
