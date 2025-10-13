import {
  Laptop2,
  PcCase,
  Monitor,
  Cpu,
  HardDrive,
  Headphones,
  Keyboard,
  Mouse,
  Gamepad2,
  Server,
  Fan,
  Speaker,
  Blocks,
  ChevronRight, // <-- ĐÃ THÊM
} from "lucide-react";
import { useState, useMemo } from "react";

/**
 * props:
 * - categories: [{ slug, name, icon? }]   // Sửa label thành name cho nhất quán
 * - panelHeight: number (px)
 * - hasContainer: boolean
 */
export default function SidebarNav({
  categories = [],
  panelHeight = 520,
  hasContainer = true,
}) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const red = "#e30019";

  const iconMap = useMemo(
    () => ({
      // ... (giữ nguyên)
      laptop: Laptop2,
      pc: PcCase,
      "pc-gvn": PcCase,
      monitor: Monitor,
      console: Gamepad2,
      handheld: Gamepad2,
      mainboard: Cpu,
      cpu: Cpu,
      vga: Cpu,
      "main-cpu-vga": Cpu,
      ram: HardDrive,
      storage: HardDrive,
      "ổ cứng": HardDrive,
      case: Server,
      cooling: Fan,
      keyboard: Keyboard,
      mouse: Mouse,
      audio: Headphones,
      headset: Headphones,
      loa: Speaker,
      speaker: Speaker,
      accessory: Blocks,
    }),
    []
  );

  const CATS_FALLBACK = [
    // ... (giữ nguyên)
    { name: "Laptop", img: "...", slug: "laptop" },
    { name: "PC", img: "...", slug: "pc" },
    { name: "Màn hình", img: "...", slug: "monitor" },
    { name: "Mainboard", img: "...", slug: "mainboard" },
    { name: "CPU", img: "...", slug: "cpu" },
    { name: "VGA", img: "...", slug: "vga" },
    { name: "RAM", img: "...", slug: "ram" },
    { name: "Ổ cứng", img: "...", slug: "storage" },
    { name: "Case", img: "...", slug: "case" },
    { name: "Tản nhiệt", img: "...", slug: "cooling" },
    { name: "Bàn phím", img: "...", slug: "keyboard" },
    { name: "Chuột", img: "...", slug: "mouse" },
    { name: "Tai nghe", img: "...", slug: "headset" },
    { name: "Loa", img: "...", slug: "speaker" },
    { name: "Console", img: "...", slug: "console" },
    { name: "Phụ kiện", img: "...", slug: "accessory" },
  ];

  // Nên dùng biến CATS đã khai báo thay vì CATS_FALLBACK
  const CATS = categories.length ? categories : CATS_FALLBACK;

  return (
    <div className="relative" onMouseLeave={() => setHoverIdx(null)}>
      <aside
        className={[
          "bg-white overflow-hidden",
          hasContainer ? "rounded-xl shadow-sm" : "",
        ].join(" ")}
        style={{ height: panelHeight }}
      >
        <ul className="py-2 h-full overflow-y-auto">
          {CATS.map((c, i) => {
            // Sửa thành CATS để dùng được cả dữ liệu thật
            const Icon = c.icon || iconMap[c.slug] || Laptop2;
            const active = hoverIdx === i;

            return (
              <li key={c.slug || c.name}>
                <button
                  type="button"
                  onMouseEnter={() => setHoverIdx(i)}
                  className={[
                    "w-full px-3 h-10 md:h-11 flex items-center gap-3 text-left transition-colors text-[13px] md:text-sm",
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
                  <span className="flex-1 font-medium">{c.name}</span>{" "}
                  {/* <-- SỬA c.label THÀNH c.name */}
                  <ChevronRight
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
