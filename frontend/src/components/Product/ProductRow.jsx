// src/components/product/ProductRow.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { Link } from "react-router-dom";

export default function ProductRow({
  title,
  viewAllHref,
  products,
  loading,
  error,
}) {
  const data = Array.isArray(products) ? products : [];
  const VISIBLE = 5;
  const GAP = 16;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps", // 🔥 THÊM: Tối ưu hiệu suất
    },
    [
      Autoplay({
        delay: 3500,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ]
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const itemStyle = useMemo(
    () => ({
      flex: `0 0 calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})`,
      minWidth: `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})`,
    }),
    []
  );

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link
          to={viewAllHref}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="relative p-4">
        <div className="overflow-hidden" ref={emblaRef}>
          {loading ? (
            <div className="flex" style={{ gap: GAP, alignItems: "stretch" }}>
              {" "}
              {/* 🔥 THÊM align-items: stretch */}
              {Array.from({ length: VISIBLE }).map((_, i) => (
                <div
                  key={i}
                  style={itemStyle}
                  className="h-full flex" // 🔥 THÊM display: flex
                >
                  <div className="h-64 rounded-xl bg-gray-100 animate-pulse w-full" />{" "}
                  {/* 🔥 THÊM w-full */}
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-red-600">Không tải được dữ liệu.</div>
          ) : (
            // Thay đổi hoàn toàn cách render
            <div
              className="grid grid-flow-col auto-cols-[calc((100%-64px)/5)] gap-4" // 5 items, gap 16px = 64px
              style={{ alignItems: "stretch" }}
            >
              {data.map((p) => (
                <div key={p.slug || p.id} className="h-full">
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}
        </div>

        {canPrev && (
          <button
            onClick={prev}
            aria-label="Trước"
            className="group absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50 z-10" // 🔥 THÊM z-10
          >
            <ChevronLeft className="transition group-active:-translate-x-[1px]" />
          </button>
        )}
        {canNext && (
          <button
            onClick={next}
            aria-label="Tiếp theo"
            className="group absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50 z-10" // 🔥 THÊM z-10
          >
            <ChevronRight className="transition group-active:translate-x-[1px]" />
          </button>
        )}
      </div>
    </section>
  );
}
