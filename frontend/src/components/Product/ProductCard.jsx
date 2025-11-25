import { Link } from "react-router-dom";
import {
  Cpu,
  HardDrive,
  CircuitBoard,
  MemoryStick,
  Monitor,
  Gauge,
  Scan,
  Layers,
  Wifi,
  Cable,
  Plug,
  Sparkles,
  Star,
} from "lucide-react";
import { getHighlightBox } from "../../utils/highlightBox";

// -------- ICON MAPPING (Giữ nguyên) --------
const ICONS = {
  cpu: Cpu,
  gpu: Monitor,
  ram: MemoryStick,
  storage: HardDrive,
  size: Monitor,
  hz: Gauge,
  res: Scan,
  panel: Layers,
  connection_wireless: Wifi,
  connection_wired: Cable,
  connection: Plug,
  led: Sparkles,
  board: CircuitBoard,
};

const IMG_WRAPPER = "relative overflow-hidden rounded-t-xl";
const IMG_BOX = "h-48 bg-gray-50 grid place-items-center";
const IMG =
  "object-contain w-auto max-w-[90%] max-h-[90%] transition-transform duration-300 ease-out group-hover:scale-105";

const INFO_BOX =
  "mt-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 px-3 text-[13px] text-gray-700 min-h-[90px] flex items-center";

const ROW = "flex items-center gap-2.5 leading-[22px] py-0.5";
const ICON_SIZE_DEFAULT = 14;

const vnd = (n) => Number(n || 0).toLocaleString() + "đ";

const CARD_WRAPPER =
  "group flex h-full flex-col rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04] hover:shadow-lg hover:ring-red-500/20 transition-all duration-300 h-full";

const SPECS_CATEGORIES = [
  "pc",
  "laptop",
  "màn hình",
  "bàn phím",
  "chuột",
  "may-tinh",
  "man-hinh",
  "ban-phim",
  "chuot",
  "pc-gaming",
  "laptop-gaming",
  "monitor",
  "keyboard",
  "mouse",
];

export default function ProductCard({ p }) {
  // Bảo vệ: Nếu không có dữ liệu sản phẩm thì không render
  if (!p) return null;

  const productUrl = p?.slug
    ? `/products/${encodeURIComponent(p.slug)}`
    : `/products/${encodeURIComponent(p?._id || p?.id)}`; // Fallback id nếu không có slug

  const items = getHighlightBox({ specs: p?.specs, category: p?.category });

  // --- PRICING ---
  const originPrice = Number(p?.price || 0);
  const salePrice = Number(p?.priceSale || p?.price || 0);
  const hasDiscount = salePrice > 0 && originPrice > salePrice;

  let percent = Number.isFinite(p?.discountPercent)
    ? Number(p.discountPercent)
    : originPrice > 0
    ? Math.round((1 - salePrice / originPrice) * 100)
    : 0;
  percent = Math.max(0, Math.min(99, percent));

  // --- RATING (ĐÃ SỬA LẠI CHO CHẮC CHẮN) ---
  // 1. Kiểm tra kỹ các trường có thể chứa số lượng review
  // Một số API trả về 'ratingCount', cái khác có thể là 'reviewsCount' hoặc 'review_count'
  const rawCount = p?.ratingCount || p?.reviewsCount || p?.reviewCount || 0;
  const ratingCount = parseInt(rawCount, 10);

  // 2. Rating value
  const ratingVal = Number(p?.rating || 0);
  const ratingDisplay = ratingVal.toFixed(1);

  // --- IMAGE ---
  const cover =
    p?.image || (Array.isArray(p?.images) ? p.images[0] : "/placeholder.png");

  // --- SPECS LOGIC ---
  const shouldShowSpecs = () => {
    const category = p?.category?.toLowerCase() || "";
    return SPECS_CATEGORIES.some((specCat) =>
      category.includes(specCat.toLowerCase())
    );
  };

  const showSpecs = shouldShowSpecs();
  const hasSpecs = items.length > 0;

  const renderIcon = (item) => {
    if (item.key === "connection") {
      const wireless = /không dây|wireless|bluetooth/i.test(item.label || "");
      const Icon = wireless
        ? ICONS.connection_wireless
        : ICONS.connection_wired;
      return (
        <Icon size={ICON_SIZE_DEFAULT} className="shrink-0 text-gray-500" />
      );
    }
    const Icon = ICONS[item.key] || ICONS.board;
    return <Icon size={ICON_SIZE_DEFAULT} className="shrink-0 text-gray-500" />;
  };

  return (
    <Link to={productUrl} className={CARD_WRAPPER} title={p?.title}>
      {/* Image Area */}
      <div className={IMG_WRAPPER}>
        <div className={IMG_BOX}>
          <img
            src={cover}
            alt={p?.title}
            className={IMG}
            loading="lazy"
            onError={(e) =>
              (e.target.src = "https://placehold.co/400x400?text=No+Image")
            } // Fallback ảnh lỗi
          />
        </div>

        {hasDiscount && percent > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-br from-red-500 to-red-600 text-white px-2.5 py-1 rounded-lg shadow-lg text-xs font-bold">
            -{percent}%
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 rounded-t-xl ring-1 ring-inset ring-black/5 group-hover:ring-black/10" />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-[15px] leading-[21px] min-h-[42px] font-semibold text-gray-800 group-hover:text-red-600 transition">
          {p?.title}
        </h3>

        {showSpecs && (
          <div className={INFO_BOX}>
            <div className="w-full space-y-0.5">
              {hasSpecs ? (
                items.slice(0, 4).map((it, i) => (
                  <div key={i} className={ROW}>
                    {renderIcon(it)}
                    <span className="truncate">{it.label}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-xs py-2">
                  Đang cập nhật thông số...
                </div>
              )}
            </div>
          </div>
        )}

        {!showSpecs && <div className="flex-1" />}

        <div className="pt-3">
          {/* Pricing */}
          <div className="h-[52px] flex flex-col justify-end">
            <div className="h-[18px] flex items-center">
              {hasDiscount && (
                <span className="text-[12px] text-gray-400 line-through">
                  {vnd(originPrice)}
                </span>
              )}
            </div>
            <div className="h-[28px] flex items-center">
              <div className="text-[18px] font-bold text-red-600">
                {vnd(salePrice)}
              </div>
            </div>
          </div>

          {/* Rating Section - Đã sửa */}
          <div className="mt-2 flex items-center gap-1.5 text-[13px] text-gray-600 border-t border-gray-100 pt-2">
            <div className="flex items-center gap-1">
              {/* Nếu chưa có rating thì hiện sao xám, có rồi thì sao vàng */}
              <Star
                size={14}
                className={ratingVal > 0 ? "text-amber-500" : "text-gray-300"}
                fill={ratingVal > 0 ? "#f59e0b" : "none"}
              />
              <span className="font-medium text-gray-800">
                {ratingVal > 0 ? ratingDisplay : "0.0"}
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">
              {ratingCount > 0 ? `${ratingCount} đánh giá` : "Chưa có đánh giá"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
