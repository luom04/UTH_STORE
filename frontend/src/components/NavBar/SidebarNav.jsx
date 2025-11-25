// src/components/NavBar/SidebarNav.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Import toàn bộ icon vào 1 namespace để tra cứu động
import * as Lucide from "lucide-react";
// Hook gọi API
import { useCategories } from "../../hooks/useCategories";

// ---- Utils: chuẩn hóa & map icon name ----
const toPascalCase = (str = "") =>
  String(str)
    .trim()
    .replace(/[_\-\s]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("");

// Map alias slug → tên icon hợp lệ của lucide-react
const SLUG_ICON_ALIAS = {
  laptop: "Laptop2",
  pc: "PcCase",
  "pc-gvn": "PcCase",
  monitor: "Monitor",
  console: "Gamepad2",
  handheld: "Gamepad2",
  mainboard: "Cpu",
  cpu: "Cpu",
  vga: "Cpu",
  "main-cpu-vga": "Cpu",
  ram: "HardDrive",
  storage: "HardDrive",
  "ổ cứng": "HardDrive",
  case: "Server",
  cooling: "Fan",
  keyboard: "Keyboard",
  mouse: "Mouse",
  audio: "Headphones",
  headset: "Headphones",
  loa: "Speaker",
  speaker: "Speaker",
  accessory: "Blocks",
};

// Trả về component icon từ tên string (API) hoặc từ slug
function resolveIcon({ iconFromApi, slug }) {
  // Ưu tiên icon từ API nếu có
  const candidates = [
    iconFromApi, // ví dụ "Laptop2"
    SLUG_ICON_ALIAS[slug], // ví dụ "Mouse" từ slug "mouse"
    toPascalCase(iconFromApi), // ví dụ "pc-case" -> "Pc Case" (không khớp) nhưng thử tiếp:
    toPascalCase(String(iconFromApi || "").replace(/\s+/g, "")), // "PcCase"
    toPascalCase(slug),
    toPascalCase(String(slug || "").replace(/\s+/g, "")),
  ].filter(Boolean);

  for (const name of candidates) {
    if (name && Lucide[name]) return Lucide[name];
  }
  // Fallback
  return Lucide.Laptop2;
}

export default function SidebarNav({
  categories = [], // vẫn giữ prop cho linh hoạt
  panelHeight = 520,
  hasContainer = true,
  onClose,
}) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const navigate = useNavigate();
  const red = "#e30019";

  // Gọi API
  const { categories: apiCategories, isLoading } = useCategories();

  const getCatalogPath = (slug) => `/collections/${slug}`;

  // Data render: ưu tiên prop, sau đó API
  const CATS = categories.length > 0 ? categories : apiCategories;

  const handleClick = (slug) => {
    if (!slug) return;
    navigate(getCatalogPath(slug));
    onClose?.();
  };

  // Loading skeleton
  if (isLoading && categories.length === 0) {
    return (
      <aside
        className={[
          "bg-white overflow-hidden",
          hasContainer ? "rounded-xl shadow-sm" : "",
        ].join(" ")}
        style={{ height: panelHeight }}
      >
        <ul className="py-2 h-full overflow-y-auto animate-pulse">
          {[...Array(12)].map((_, i) => (
            <li
              key={i}
              className="w-full px-3 h-10 md:h-11 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-md bg-gray-200"></div>
              <div className="flex-1 h-5 rounded bg-gray-200"></div>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <div className="relative " onMouseLeave={() => setHoverIdx(null)}>
      <aside
        className={[
          "bg-white overflow-hidden",
          hasContainer ? "rounded-xl shadow-sm" : "",
        ].join(" ")}
        style={{ height: panelHeight }}
      >
        <ul className="py-2 h-full overflow-y-auto">
          {CATS.map((c, i) => {
            // c.icon: string icon từ API (vd: "Laptop2")
            // c.slug/c.name: dùng làm fallback map
            const Icon = resolveIcon({
              iconFromApi: c.icon,
              slug: c.slug || c.name,
            });
            const active = hoverIdx === i;

            return (
              <li key={c.slug || c.name || i}>
                <button
                  type="button"
                  onMouseEnter={() => setHoverIdx(i)}
                  onClick={() => handleClick(c.slug)}
                  className={[
                    "w-full px-3 h-10 md:h-11 flex items-center gap-3 text-left transition-colors text-[13px] md:text-sm cursor-pointer",
                    active ? "text-white" : "hover:bg-gray-100",
                  ].join(" ")}
                  style={active ? { backgroundColor: red } : {}}
                >
                  <span
                    className={[
                      "w-8 h-8 rounded-md grid place-items-center border",
                      active
                        ? "border-white/50 bg-white/10"
                        : "border-gray-300 bg-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-white" : "text-gray-700"}
                    />
                  </span>
                  <span className="flex-1 font-medium">{c.name}</span>
                  <Lucide.ChevronRight
                    size={16}
                    className={active ? "opacity-100" : "opacity-50"}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
