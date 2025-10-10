// src/components/NavBar/SidebarNav.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Laptop2,
  Monitor,
  Cpu,
  HardDrive,
  Headphones,
  Keyboard,
  Mouse,
  Gamepad2,
  ShoppingBasket,
  ChevronRight,
} from "lucide-react";

/** Mock data: mỗi category có icon + tiêu đề + nhóm cột trong mega menu */
const CATS = [
  {
    slug: "laptop",
    label: "Laptop",
    icon: Laptop2,
    mega: [
      {
        title: "Dòng laptop",
        items: ["Văn phòng", "Gaming", "Đồ họa", "Mỏng nhẹ", "Xem tất cả"],
      },
      {
        title: "Thương hiệu",
        items: ["ASUS", "MSI", "Lenovo", "Acer", "HP", "Xem tất cả"],
      },
      {
        title: "Tầm giá",
        items: ["< 15 triệu", "15–25 triệu", "25–35 triệu", "> 35 triệu"],
      },
    ],
  },
  {
    slug: "pc-gvn",
    label: "PC GVN",
    icon: ShoppingBasket,
    mega: [
      {
        title: "Cấu hình",
        items: [
          "i5 + RTX 4060",
          "i7 + RTX 4070",
          "R5 + RTX 4060Ti",
          "Xem tất cả",
        ],
      },
      {
        title: "Mục đích",
        items: ["Học tập", "Văn phòng", "Gaming", "Streaming"],
      },
    ],
  },
  {
    slug: "main-cpu-vga",
    label: "Main, CPU, VGA",
    icon: Cpu,
    mega: [
      {
        title: "CPU",
        items: [
          "Intel Gen 13",
          "Intel Gen 14",
          "Ryzen 5",
          "Ryzen 7",
          "Xem tất cả",
        ],
      },
      { title: "Mainboard", items: ["B660", "B760", "Z690", "X670", "B650"] },
      {
        title: "VGA",
        items: ["RTX 4060", "RTX 4070", "RTX 4080", "RX 7700 XT"],
      },
    ],
  },
  {
    slug: "storage-ram",
    label: "Ổ cứng, RAM, Thẻ nhớ",
    icon: HardDrive,
    mega: [
      {
        title: "Dung lượng RAM",
        items: ["8 GB", "16 GB", "32 GB", "64 GB", "Xem tất cả"],
      },
      {
        title: "Dung lượng SSD",
        items: ["250GB–256GB", "480GB–512GB", "960GB–1TB", "2TB", "Trên 2TB"],
      },
      {
        title: "Hãng SSD",
        items: ["Samsung", "WD", "Kingston", "Corsair", "PNY", "Xem tất cả"],
      },
      { title: "Thẻ nhớ / USB", items: ["Sandisk"] },
    ],
  },
  { slug: "audio", label: "Loa, Micro, Webcam", icon: Headphones, mega: [] },
  { slug: "monitor", label: "Màn hình", icon: Monitor, mega: [] },
  { slug: "keyboard", label: "Bàn phím", icon: Keyboard, mega: [] },
  { slug: "mouse", label: "Chuột + Lót chuột", icon: Mouse, mega: [] },
  { slug: "console", label: "Handheld, Console", icon: Gamepad2, mega: [] },
];

export default function SidebarNav({ panelHeight = 360 }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const red = "#e30019";

  return (
    <div className="relative" onMouseLeave={() => setHoverIdx(null)}>
      {/* Sidebar khớp chiều cao banner, cho phép scroll nếu dài */}
      <aside
        className="bg-white rounded-xl border shadow-sm overflow-hidden h-full"
        style={{ height: panelHeight }}
      >
        <ul className="py-2 h-full overflow-y-auto">
          {CATS.map((c, i) => {
            const Icon = c.icon;
            const active = hoverIdx === i;
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onMouseEnter={() => setHoverIdx(i)}
                  className={[
                    "w-full px-3 h-11 flex items-center gap-3 text-left transition-colors",
                    active ? `bg-[${red}] text-white` : "hover:bg-gray-100",
                  ].join(" ")}
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
                  <span className="flex-1 font-medium">{c.label}</span>
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

      {/* Mega menu nổi trên banner + hover được */}
      {hoverIdx !== null && CATS[hoverIdx]?.mega?.length > 0 && (
        <div
          className="absolute top-0 left-[calc(100%+12px)] z-40 pointer-events-auto"
          style={{ height: panelHeight, right: 0 }}
        >
          <div className="bg-white rounded-xl border shadow-lg h-full p-6 grid grid-cols-3 gap-8 overflow-auto">
            {CATS[hoverIdx].mega.map((col, idx) => (
              <div key={idx}>
                <div className={`text-[${red}] font-semibold mb-3`}>
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.items.map((name) => (
                    <li key={name}>
                      <Link
                        to={`/c/${CATS[hoverIdx].slug}`}
                        className="text-gray-700 hover:underline"
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
