import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBanners } from "../../hooks/useBanners";

const DESKTOP_HEIGHT = 360;
const MOBILE_HEIGHT = 220;
const BOTTOM_HEIGHT = 160;

const FALLBACK_IMG = "https://placehold.co/800x400?text=Banner+Quang+Cao";

// ✅ [NEW] Helper: Xử lý link động (Product/Category/External)
const getBannerLink = (banner) => {
  if (banner.link && !banner.linkType) return banner.link; // Fallback dữ liệu cũ

  const val = banner.linkValue || "";
  switch (banner.linkType) {
    case "PRODUCT":
      return `/products/${val}`;
    case "CATEGORY":
      return `/collections/${val}`;
    case "EXTERNAL":
      return val;
    case "CUSTOM":
      return val;
    default:
      return "#";
  }
};

// ✅ [NEW] Component Wrapper: Tự chọn thẻ Link hoặc a href
const BannerLink = ({ banner, children, className }) => {
  const to = getBannerLink(banner);
  const isExternal = banner.linkType === "EXTERNAL";

  if (!to || to === "#") return <div className={className}>{children}</div>;

  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

export default function Banner() {
  const { data: banners = [], isLoading } = useBanners();

  const sliderBanners = banners.filter((b) => b.type === "slider");
  const rightBanners = banners.filter((b) => b.type === "right").slice(0, 2);
  const bottomBanners = banners.filter((b) => b.type === "bottom").slice(0, 3);

  if (isLoading)
    return (
      <div className="w-full h-[360px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Đang tải nội dung...
      </div>
    );

  if (banners.length === 0) return null;

  return (
    <>
      {/* Mobile: Gộp tất cả banner active thành 1 slider */}
      <div className="block lg:hidden">
        <SingleSlider
          list={[...sliderBanners, ...rightBanners, ...bottomBanners]}
          height={MOBILE_HEIGHT}
        />
      </div>

      {/* Desktop: Layout 2 cột + Hàng dưới */}
      <div className="hidden lg:block">
        <DesktopBanner
          sliders={sliderBanners}
          rightBoxes={rightBanners}
          bottomBoxes={bottomBanners}
          panelHeight={DESKTOP_HEIGHT}
          bottomRowHeight={BOTTOM_HEIGHT}
        />
      </div>
    </>
  );
}

/* ============ COMPONENTS CON ============ */

function SingleSlider({ list, height }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000 }),
  ]);

  if (!list || list.length === 0) return null;

  return (
    <div
      className="relative rounded-xl overflow-hidden w-full"
      style={{ height }}
    >
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {list.map((b, i) => (
            <BannerLink
              key={b._id || i}
              banner={b}
              className="min-w-0 flex-[0_0_100%] h-full relative block"
            >
              <img
                src={b.image || FALLBACK_IMG}
                alt={b.title}
                className="w-full h-full object-cover"
              />
            </BannerLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopBanner({
  sliders,
  rightBoxes,
  bottomBoxes,
  panelHeight,
  bottomRowHeight,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000 }),
  ]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", () => setSelected(emblaApi.selectedScrollSnap()));
  }, [emblaApi, sliders]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-1">
        {/* 1. SLIDER CHÍNH (2/3) */}
        <div className="col-span-2">
          <div
            className="relative rounded-xl overflow-hidden w-full"
            style={{ height: panelHeight }}
          >
            {sliders.length > 0 ? (
              <>
                <div className="overflow-hidden h-full" ref={emblaRef}>
                  <div className="flex h-full">
                    {sliders.map((b, i) => (
                      <BannerLink
                        key={b._id || i}
                        banner={b}
                        className="min-w-0 flex-[0_0_100%] h-full block"
                      >
                        <img
                          src={b.image || FALLBACK_IMG}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </BannerLink>
                    ))}
                  </div>
                </div>
                {/* Navigation */}
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full z-10 transition"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full z-10 transition"
                >
                  <ChevronRight size={22} />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {snaps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => emblaApi?.scrollTo(i)}
                      className={`h-[3px] rounded-full transition-all ${
                        i === selected
                          ? "w-8 bg-white"
                          : "w-5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400">
                <p>Chưa có banner slider</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. CỘT PHẢI (1/3) */}
        <div className="flex flex-col gap-1" style={{ height: panelHeight }}>
          {rightBoxes.map((b, i) => (
            <BannerLink
              key={b._id || i}
              banner={b}
              className="relative rounded-xl overflow-hidden h-1/2 block group"
            >
              <img
                src={b.image || FALLBACK_IMG}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
              <div className="relative z-10 p-4 text-white">
                <div className="text-xs opacity-90 font-medium uppercase tracking-wider">
                  {b.title}
                </div>
                <div className="text-lg font-bold leading-tight">
                  {b.subtitle}
                </div>
              </div>
            </BannerLink>
          ))}
          {/* Fill nếu thiếu ảnh */}
          {Array.from({ length: Math.max(0, 2 - rightBoxes.length) }).map(
            (_, i) => (
              <div
                key={`ph-r-${i}`}
                className="h-1/2 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400"
              >
                Vị trí trống
              </div>
            )
          )}
        </div>
      </div>

      {/* 3. HÀNG DƯỚI (3 ảnh) */}
      {bottomBoxes.length > 0 && (
        <div
          className="grid grid-cols-3 gap-1 mt-1"
          style={{ height: bottomRowHeight }}
        >
          {bottomBoxes.map((b, i) => (
            <BannerLink
              key={b._id || i}
              banner={b}
              className="relative rounded-xl overflow-hidden block group"
            >
              <img
                src={b.image || FALLBACK_IMG}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {(b.title || b.subtitle) && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                  <div className="relative z-10 p-4 text-white">
                    <div className="text-xs opacity-90 font-medium uppercase tracking-wider">
                      {b.title}
                    </div>
                    <div className="text-lg font-bold leading-tight">
                      {b.subtitle}
                    </div>
                  </div>
                </>
              )}
            </BannerLink>
          ))}
          {/* Fill nếu thiếu ảnh */}
          {Array.from({ length: Math.max(0, 3 - bottomBoxes.length) }).map(
            (_, i) => (
              <div
                key={`ph-b-${i}`}
                className="bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400"
              >
                Vị trí trống
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
