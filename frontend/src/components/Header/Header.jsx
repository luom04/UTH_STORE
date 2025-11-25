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

// tô đậm các đoạn trùng với q
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
      <mark key={i} className="bg-yellow-200 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function SuggestItem({ item, active, query, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-3 py-2 text-left " +
        (active ? "bg-gray-100" : "hover:bg-gray-50")
      }
    >
      <div className="h-10 w-10 rounded border bg-white overflow-hidden shrink-0 grid place-items-center">
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
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 line-clamp-1">
          {highlight(item.title, query)}
        </div>
        <div className="text-xs text-gray-500 line-clamp-1">
          {(item.brand || item.category) && (
            <>
              {item.brand ? `${item.brand} · ` : ""}
              {item.category || ""}
            </>
          )}
        </div>
      </div>
      <div className="ml-2 text-[13px] font-semibold text-red-600 shrink-0">
        {typeof item.price === "number"
          ? item.price.toLocaleString() + "đ"
          : ""}
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

  // ✅ Lấy giỏ hàng từ API
  const { cart, isLoading: isCartLoading } = useCart();

  // Tổng số sản phẩm trong giỏ (BE trả itemCount, fallback = 0)
  const cartCount = cart?.itemCount ?? 0;
  // search state
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // index đang chọn trong dropdown
  const inputRef = useRef(null);
  const popRef = useRef(null);

  // gọi API suggest (lọc trên BE bằng ApiFeatures)
  const { data: items = [], isFetching } = useSearchSuggest(q, {
    limit: 8,
    enabled: open && q.trim().length > 0,
  });

  // đóng khi click ra ngoài
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

  // bàn phím trong ô input
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
        // tới trang chi tiết theo id (an toàn với routing hiện tại)
        navigate(`/products/${items[active].id}`);
        setOpen(false);
        setActive(-1);
      } else if (q.trim()) {
        // nếu chưa chọn item -> đi trang search
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
          className="hidden sm:flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg h-10 px-3 transition-colors duration-150"
        >
          <Menu size={18} />
          <span className="font-medium">Danh mục</span>
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

          {/* Dropdown */}
          {open && (
            <div
              ref={popRef}
              className="absolute left-0 right-0 mt-2 rounded-xl bg-white text-gray-800 shadow-xl border overflow-hidden z-[60]"
            >
              {isFetching ? (
                <div className="p-3 text-sm text-gray-500">Đang tìm…</div>
              ) : items.length > 0 ? (
                <div role="listbox" aria-label="Gợi ý tìm kiếm">
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
                  <div className="border-t p-2">
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
                      className="w-full rounded-lg px-3 py-2 text-sm text-center hover:bg-gray-50"
                    >
                      Tìm “<span className="font-medium">{q}</span>”
                    </button>
                  </div>
                </div>
              ) : q.trim() ? (
                <div className="px-4 py-3 text-sm text-gray-600 text-center">
                  Không có sản phẩm nào…
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
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 border border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.1)]"
            >
              <UserCog size={18} />
              <div className="leading-4">
                <div className="text-xs opacity-80">Trang</div>
                <div className="text-sm font-semibold">Quản trị</div>
              </div>
            </Link>

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

        {/* === ACTIONS: KHÁCH === */}
        {!isStaffOrAdmin && (
          <div className="hidden md:flex items-center gap-2 ml-2">
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

              {/* ✅ Badge số sản phẩm trong giỏ */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-yellow-300 text-black text-[10px] font-bold rounded-full min-w-4 h-4 px-[2px] grid place-items-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {!isAuthenticated ? (
              <Link
                to={PATHS.LOGIN}
                className="flex items-center gap-2 bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg h-10 px-3 transition-colors duration-150"
              >
                <UserCircle size={18} />
                <span className="font-medium">Đăng nhập</span>
              </Link>
            ) : (
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
