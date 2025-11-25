// src/components/Categories/CategoriesSection.jsx
import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";

const COLS = 10;
const IMAGE_SIZE = "72px"; // Đã giảm kích thước ảnh một chút (từ 80px xuống 72px)

export default function CategoriesSection({ title = "Danh mục sản phẩm" }) {
  const { categories = [], isLoading, error } = useCategories();

  // Chia mảng thành các hàng, mỗi hàng tối đa 10 item
  const rows = chunkArray(categories, COLS);

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Loading skeleton: giữ khung 10 cột */}
        {isLoading && (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: COLS }).map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="rounded-xl bg-gray-100 animate-pulse"
                  style={{ height: IMAGE_SIZE, width: IMAGE_SIZE }}
                />
                <div className="mt-3 h-3 w-16 rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-sm text-red-600">
            Không tải được danh mục. Vui lòng thử lại.
          </div>
        )}

        {!isLoading &&
          !error &&
          rows.length > 0 &&
          rows.map((row, idx) => {
            const cols = row.length === COLS ? COLS : row.length; // hàng cuối < 10 → k cột
            return (
              <div
                key={idx}
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {row.map((c) => (
                  <Link
                    key={c._id || c.slug}
                    to={`/collections/${c.slug}`}
                    title={c.slug}
                    className="group flex flex-col items-center text-center"
                  >
                    {/* CARD IMAGE CONTAINER */}
                    {/* Đã giảm kích thước từ h-20 w-20 (80px) xuống 72px */}
                    <div
                      className="relative overflow-hidden rounded-xl group-hover:shadow transition mx-auto flex items-center justify-center p-2" // Thêm flexbox và padding
                      style={{ height: IMAGE_SIZE, width: IMAGE_SIZE }}
                    >
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.slug}
                          className="max-h-full max-w-full object-contain" // Thay đổi object-cover thành object-contain và loại bỏ absolute inset-0
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="grid place-items-center text-xs text-gray-400">
                          no-image
                        </div>
                      )}
                    </div>
                    <div className="mt-3 w-full truncate text-sm font-medium text-gray-800 group-hover:text-black">
                      {c.slug}
                    </div>
                  </Link>
                ))}
              </div>
            );
          })}

        {!isLoading && !error && categories.length === 0 && (
          <div className="text-sm text-gray-500">Chưa có danh mục nào.</div>
        )}
      </div>
    </section>
  );
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
