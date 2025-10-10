// src/components/Banner/BannerHome.jsx
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerHome({ panelHeight = 360 }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onDotClick = useCallback(
    (index) => emblaApi?.scrollTo(index),
    [emblaApi]
  );
  const onSelect = useCallback(
    () => emblaApi && setSelectedIndex(emblaApi.selectedScrollSnap()),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const sliderImages = [
    // ...giữ nguyên list ảnh của bạn...
    "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop",
  ];

  const rightBoxes = [
    /* ...giữ nguyên... */
  ];
  const bottomBoxes = [
    /* ...giữ nguyên... */
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Main slider — cao = panelHeight */}
        <div className="col-span-2">
          <div
            className="relative rounded-xl overflow-hidden z-0" /* z-0 để mega menu đè lên */
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {sliderImages.map((src, i) => (
                  <div key={i} className="min-w-0 flex-[0_0_100%]">
                    <img
                      src={src}
                      alt={`banner-${i}`}
                      className="w-full object-cover"
                      style={{ height: panelHeight }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* arrows */}
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition z-10"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>

            {/* dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onDotClick(index)}
                  className={`h-2 rounded-full transition ${
                    index === selectedIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Small boxes (giữ nguyên) */}
        <div className="flex flex-col gap-4" style={{ height: panelHeight }}>
          {rightBoxes.map((box, i) => (
            <div
              key={i}
              className={`${box.color} rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition h-1/2 flex items-end relative overflow-hidden`}
            >
              <img
                src={box.image}
                alt={box.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10">
                <div className="text-xs opacity-90">{box.title}</div>
                <div className="text-lg font-bold">{box.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row giữ nguyên */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {bottomBoxes.map((box, i) => (
          <div
            key={i}
            className={`${box.color} rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition h-40 flex items-center justify-between overflow-hidden`}
          >
            <div className="relative z-10 flex-1">
              <div className="text-sm opacity-90">UƯU ĐÃI HSSV</div>
              <div className="text-2xl font-bold">{box.title}</div>
            </div>
            <img
              src={box.image}
              alt={box.title}
              className="w-32 h-32 object-cover rounded-lg opacity-80"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
