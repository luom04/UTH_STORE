// src/components/Search/SearchDropdown.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiSearchSuggest } from "../../api/search";

function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const toVND = (n) =>
  n == null
    ? ""
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n);

// Escape regex special chars
const esc = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Highlight helper: returns an array of React nodes
function highlight(text = "", query = "") {
  if (!query) return [text];
  const re = new RegExp(esc(query), "ig");
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <mark key={out.length} className="bg-yellow-200 rounded px-0.5">
        {text.slice(m.index, re.lastIndex)}
      </mark>
    );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Dropdown gợi ý kết quả tìm kiếm
 * Props:
 *  - query: string
 *  - open: boolean
 *  - onClose: () => void
 *  - inputRef?: React.RefObject<HTMLInputElement>  // để bắt phím trên input
 */
export default function SearchDropdown({ query, open, onClose, inputRef }) {
  const navigate = useNavigate();
  const debounced = useDebouncedValue(query, 250);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0); // index đang chọn
  const listRef = useRef(null);
  const wrapRef = useRef(null);

  // đóng khi click ra ngoài
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) onClose?.();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  // fetch gợi ý
  useEffect(() => {
    let ok = true;
    (async () => {
      if (!open || !debounced?.trim()) {
        ok && setItems([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await apiSearchSuggest({ q: debounced, limit: 8 });
        if (ok) {
          const arr = Array.isArray(data) ? data : [];
          setItems(arr);
          setActive(0);
        }
      } finally {
        ok && setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [debounced, open]);

  // chuẩn hoá field để hiển thị
  const rows = useMemo(
    () =>
      items.map((p) => {
        const priceNow = p.priceSale != null ? p.priceSale : p.price;
        const priceOld = p.priceSale != null ? p.price : null;
        return {
          id: p.id || p._id || p.slug,
          title: p.title || p.name || p.slug,
          img:
            (Array.isArray(p.images) && p.images[0]) ||
            p.thumbnail ||
            p.image ||
            "",
          priceNow,
          priceOld,
          slug: p.slug,
        };
      }),
    [items]
  );

  const visible = open && (loading || rows.length > 0 || query?.trim());

  const go = (it) => {
    const idOrSlug = it.slug || it.id;
    if (!idOrSlug) return;
    navigate(`/product/${idOrSlug}`);
    onClose?.();
  };

  // Điều hướng bằng phím trên chính ô input
  useEffect(() => {
    const el = inputRef?.current;
    if (!el) return;
    const handler = (e) => {
      if (!open) return;
      if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        setActive((i) => (rows.length ? (i + 1) % rows.length : 0));
      } else if (e.key === "ArrowUp") {
        setActive((i) =>
          rows.length ? (i - 1 + rows.length) % rows.length : 0
        );
      } else if (e.key === "Enter") {
        if (rows.length)
          go(rows[Math.max(0, Math.min(active, rows.length - 1))]);
      } else if (e.key === "Escape" || e.key === "Tab") {
        onClose?.();
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [inputRef, open, rows, active, onClose]);

  // Scroll item đang active vào view
  useEffect(() => {
    const el = document.getElementById(`sd-item-${active}`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!visible) return null;

  return (
    <div
      ref={wrapRef}
      className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70]
                 rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
    >
      {/* Loading */}
      {loading && (
        <ul className="max-h-[70vh] overflow-auto divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-3"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-56 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="h-12 w-12 rounded-md bg-gray-100 animate-pulse" />
            </li>
          ))}
        </ul>
      )}

      {/* Results */}
      {!loading && rows.length > 0 && (
        <ul
          ref={listRef}
          className="max-h-[70vh] overflow-auto divide-y"
          role="listbox"
        >
          {rows.map((p, i) => {
            const isActive = i === active;
            return (
              <li
                id={`sd-item-${i}`}
                key={p.id}
                role="option"
                aria-selected={isActive}
                className={[
                  "flex items-center justify-between gap-3 px-3 py-3 cursor-pointer",
                  isActive ? "bg-gray-100" : "hover:bg-gray-50",
                ].join(" ")}
                onMouseDown={(e) => e.preventDefault()} // tránh blur input
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p)}
                title={p.title}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {highlight(p.title, query)}
                  </div>
                  <div className="mt-1 text-[13px]">
                    <span className="font-bold text-red-600">
                      {toVND(p.priceNow)}
                    </span>
                    {p.priceOld != null && (
                      <span className="ml-2 text-gray-400 line-through">
                        {toVND(p.priceOld)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 h-12 w-12 rounded-md bg-gray-50 ring-1 ring-gray-100 overflow-hidden grid place-items-center">
                  {p.img ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img
                      src={p.img}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-[11px] text-gray-400">no-img</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Empty */}
      {!loading && rows.length === 0 && query?.trim() && (
        <div className="px-4 py-5 text-center text-sm text-gray-600">
          Không có sản phẩm nào...
        </div>
      )}
    </div>
  );
}
