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
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ thêm

export default function SidebarNav({
  categories = [],
  panelHeight = 520,
  hasContainer = true,
  onClose, // ⬅️ Nhận prop onClose
}) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const navigate = useNavigate();
  const red = "#e30019";

  const getCatalogPath = (slug) => `/collections/${slug}`;

  const iconMap = useMemo(
    () => ({
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
    { name: "Laptop", slug: "laptop" },
    { name: "PC", slug: "pc" },
    { name: "Màn hình", slug: "monitor" },
    { name: "Mainboard", slug: "mainboard" },
    { name: "CPU", slug: "cpu" },
    { name: "VGA", slug: "vga" },
    { name: "RAM", slug: "ram" },
    { name: "Ổ cứng", slug: "storage" },
    { name: "Case", slug: "case" },
    { name: "Tản nhiệt", slug: "cooling" },
    { name: "Bàn phím", slug: "keyboard" },
    { name: "Chuột", slug: "mouse" },
    { name: "Tai nghe", slug: "headset" },
    { name: "Loa", slug: "speaker" },
    { name: "Console", slug: "console" },
    { name: "Phụ kiện", slug: "accessory" },
  ];

  const CATS = categories.length ? categories : CATS_FALLBACK;

  const handleClick = (slug) => {
    if (!slug) return;
    navigate(getCatalogPath(slug));

    // ⬅️ Đóng sidebar sau khi navigate
    if (onClose) {
      onClose();
    }
  };

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
            const Icon = c.icon || iconMap[c.slug] || Laptop2;
            const active = hoverIdx === i;

            return (
              <li key={c.slug || c.name}>
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
