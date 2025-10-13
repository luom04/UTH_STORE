// src/components/product/ProductCard.jsx
export default function ProductCard({ p }) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-sm hover:shadow-md transition">
      {/* Ảnh cố định cao -> các card bằng nhau */}
      <div className="relative">
        <img
          src={p.image}
          alt={p.title}
          className="h-44 w-full object-cover bg-gray-50"
          loading="lazy"
        />
        {/* ĐÃ BỎ badge giảm giá / hộp quà */}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {/* Tiêu đề 2 dòng */}
        <h3 className="line-clamp-2 text-[15px] font-semibold text-gray-800">
          {p.title}
        </h3>

        {/* Chips thông số: giữ chiều cao tối thiểu để không lệch card */}
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

        {/* Giá – đẩy xuống đáy để các card bằng cao */}
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
    </div>
  );
}
