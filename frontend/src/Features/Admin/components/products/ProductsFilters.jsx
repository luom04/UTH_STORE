// src/Features/Admin/components/products/ProductsFilters.jsx
import { Search } from "lucide-react";

export default function ProductsFilters({
  q,
  setQ,
  stockFilter,
  setStockFilter,
  setPage,
}) {
  return (
    <div className="mb-4 flex flex-col md:flex-row gap-3">
      <div className="flex-1">
        <div className="relative">
          <input
            className="w-full rounded-lg border px-3 py-2 pr-9"
            placeholder="Tìm theo tên/slug/brand…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      <select
        className="rounded-lg border px-3 py-2 w-full md:w-56"
        value={stockFilter}
        onChange={(e) => {
          setStockFilter(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Tất cả trạng thái kho</option>
        <option value="in">Còn hàng</option>
        <option value="out">Hết hàng</option>
      </select>
    </div>
  );
}
