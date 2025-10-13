// src/components/Banner/BannerHome.jsx
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DESKTOP_HEIGHT = 360; // cao khối trên ở desktop
const MOBILE_HEIGHT = 220; // cao slider ở mobile
const BOTTOM_HEIGHT = 160; // cao 3 banner hàng dưới

export default function Banner() {
  return (
    <>
      {/* Mobile/Tablet: 1 slider duy nhất */}
      <div className="block lg:hidden">
        <SingleSlider height={MOBILE_HEIGHT} />
      </div>

      {/* Desktop: layout 2/3 + 1/3 + 3 ô dưới */}
      <div className="hidden lg:block">
        <DesktopBanner
          panelHeight={DESKTOP_HEIGHT}
          bottomRowHeight={BOTTOM_HEIGHT}
        />
      </div>
    </>
  );
}

/* ============ COMMON DATA (ảnh mẫu – sau thay bằng API) ============ */
const sliderImages = [
  "https://images.unsplash.com/photo-1588872657412-1f3a5cd3dba1?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
];
const rightBoxes = [
  {
    title: "BUILD PC",
    subtitle: "Tặng màn hình GAMING 240Hz",
    image:
      "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "PHÍM CƠ",
    subtitle: "Giảm lên đến 26%",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
  },
];
const bottomBoxes = [
  {
    title: "LAPTOP GAMING",
    subtitle: "MUA 1 TẶNG 5",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "LAPTOP OFFICE",
    subtitle: "MUA 1 TẶNG 4",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "PC GAMING",
    subtitle: "Giảm đến 500.000đ",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
  },
];

/* ============ COMPONENTS ============ */
function SingleSlider({ height }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div
      className="relative rounded-xl overflow-hidden w-full"
      style={{ height }}
    >
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {sliderImages.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%] h-full">
              <img
                src={src}
                alt={`banner-${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10"
        aria-label="Prev"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {snaps.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-[3px] rounded-full transition ${
              i === selected
                ? "w-10 bg-white"
                : "w-6 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function DesktopBanner({ panelHeight, bottomRowHeight }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="w-full">
      {/* hàng trên: slider 2/3 + 2 ô dọc 1/3 */}
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-2">
          <div
            className="relative rounded-xl overflow-hidden w-full"
            style={{ height: panelHeight }}
          >
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {sliderImages.map((src, i) => (
                  <div key={i} className="min-w-0 flex-[0_0_100%] h-full">
                    <img
                      src={src}
                      alt={`banner-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {snaps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-[3px] rounded-full transition ${
                    i === selected
                      ? "w-10 bg-white"
                      : "w-6 bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1" style={{ height: panelHeight }}>
          {rightBoxes.map((b, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden h-1/2">
              <img
                src={b.image}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/35 to-transparent" />
              <div className="relative z-10 p-4 text-white">
                <div className="text-xs opacity-90">{b.title}</div>
                <div className="text-xl font-bold leading-tight">
                  {b.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* hàng dưới: 3 banner nhỏ */}
      <div
        className="grid grid-cols-3 gap-1 mt-1"
        style={{ height: bottomRowHeight }}
      >
        {bottomBoxes.map((b, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden">
            <img
              src={b.image}
              alt={b.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
            <div className="relative z-10 p-4 text-white">
              <div className="text-xs opacity-90">{b.title}</div>
              <div className="text-xl font-bold leading-tight">
                {b.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
