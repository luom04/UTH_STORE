// src/components/product/ProductRow.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { Link } from "react-router-dom";

const MOCK_PRODUCTS = [
  {
    id: "p1",
    title: "PC GVN i5-12400F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    chips: ["i5 12400F", "B760", "16GB", "500GB", "RTX 3050"],
  },
  {
    id: "p2",
    title: "PC GVN i3-12100F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=800&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    chips: ["i3 12100F", "H610", "8GB", "250GB", "RTX 3050"],
  },
  {
    id: "p3",
    title: "PC GVN x MSI PROJECT ZERO WHITE",
    image:
      "https://images.unsplash.com/photo-1593642634367-d91a1355875?q=80&w=800&auto=format&fit=crop",
    price: 30990000,
    oldPrice: 33020000,
    chips: ["i5 14400F", "B760", "16GB", "1TB", "RTX 4060"],
  },
  {
    id: "p4",
    title: "PC GVN i3-12100F / RX 6500XT",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    price: 10490000,
    oldPrice: 11430000,
    chips: ["i3 12100F", "RX 6500XT", "8GB", "250GB"],
  },
  {
    id: "p5",
    title: "PC GVN i5-12400F / RTX 3060",
    image:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop",
    price: 16890000,
    oldPrice: 18620000,
    chips: ["i5 12400F", "B760", "16GB", "500GB", "RTX 3060"],
  },
  {
    id: "p6",
    title: "PC GVN i5-13400F / RTX 4060",
    image:
      "https://images.unsplash.com/photo-1614064641938-3bbee52958a5?q=80&w=800&auto=format&fit=crop",
    price: 21990000,
    oldPrice: 23990000,
    chips: ["i5 13400F", "B760", "16GB", "500GB", "RTX 4060"],
  },
];

export default function ProductRow({ title, viewAllHref, products }) {
  const data = products?.length ? products : MOCK_PRODUCTS; // ← fallback
  // cấu hình: 5 card/khung + khoảng cách
  const VISIBLE = 5;
  const GAP = 16; // px (tailwind gap-4)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, align: "start", dragFree: true },
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

  // width mỗi item = (100% - gap*(VISIBLE-1)) / VISIBLE  -> vừa khít 5 thẻ
  const itemStyle = useMemo(
    () => ({
      flex: `0 0 calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})`,
      minWidth: `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})`,
    }),
    []
  );

  return (
    <section className="rounded-xl bg-white shadow-sm">
      {/* header (bỏ 'Trả góp 0%') */}
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
          <div className="flex" style={{ gap: GAP }}>
            {data.map((p) => (
              <div key={p.id} style={itemStyle} className="h-full">
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next */}
        {canPrev && (
          <button
            onClick={prev}
            aria-label="Trước"
            className="group absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50"
          >
            <ChevronLeft className="transition group-active:-translate-x-[1px]" />
          </button>
        )}
        {canNext && (
          <button
            onClick={next}
            aria-label="Tiếp theo"
            className="group absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50"
          >
            <ChevronRight className="transition group-active:translate-x-[1px]" />
          </button>
        )}
      </div>
    </section>
  );
}
