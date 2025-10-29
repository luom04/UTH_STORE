// src/components/product/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  return (
    <Link
      to={`/products/${p.id}`}
      className="flex h-full flex-col rounded-xl bg-white shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Ảnh */}
      <div className="relative block">
        <img
          src={p.image}
          alt={p.title}
          className="h-44 w-full object-cover bg-gray-50 rounded-t-xl"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        {/* Tiêu đề */}
        <h3 className="line-clamp-2 text-[15px] font-semibold text-gray-800 hover:text-red-600 transition">
          {p.title}
        </h3>

        {/* Chips */}
        {p.chips?.length ? (
          <div className="mt-2 flex min-h-[48px] flex-wrap gap-2 text-[12px] text-gray-600">
            {p.chips.map((c) => (
              <span key={c} className="rounded-md border px-2 py-[2px]">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-2 min-h-[48px]" />
        )}

        {/* Giá */}
        <div className="mt-auto space-y-1">
          {p.oldPrice && p.oldPrice > p.price ? (
            <div className="text-sm text-gray-400 line-through">
              {p.oldPrice.toLocaleString()}đ
            </div>
          ) : null}
          <div className="text-[18px] font-bold text-red-600">
            {p.price.toLocaleString()}đ
          </div>
        </div>
      </div>
    </Link>
  );
}
