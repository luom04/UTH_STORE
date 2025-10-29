// src/Features/Admin/components/products/StockBadge.jsx
export default function StockBadge({ stock = 0 }) {
  const ok = Number(stock) > 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[2px] text-xs ${
        ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {ok ? "Còn hàng" : "Hết hàng"}
    </span>
  );
}
