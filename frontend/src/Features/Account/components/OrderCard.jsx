// src/Features/Account/components/OrderCard.jsx
const STATUS_TEXT = {
  processing: "Đang xử lý",
  shipping: "Đang vận chuyển",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

export default function OrderCard({ o }) {
  const totalQty = o.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Mã đơn: <span className="font-semibold text-gray-800">{o.id}</span>
          <span className="mx-2">•</span>
          Ngày đặt: {new Date(o.createdAt).toLocaleString()}
        </div>

        <div
          className={[
            "rounded-full px-3 py-1 text-sm font-medium",
            o.status === "processing" && "bg-amber-50 text-amber-700",
            o.status === "shipping" && "bg-blue-50 text-blue-700",
            o.status === "completed" && "bg-emerald-50 text-emerald-700",
            o.status === "cancelled" && "bg-rose-50 text-rose-700",
          ].join(" ")}
        >
          {STATUS_TEXT[o.status]}
        </div>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto">
        {o.items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 min-w-[220px]">
            <img
              src={it.image}
              alt={it.title}
              className="h-16 w-16 rounded-md object-cover bg-gray-50"
            />
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">
                SL: {it.qty} • {it.price.toLocaleString()}đ
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">Tổng số lượng: {totalQty}</div>
        <div className="text-base">
          <span className="text-gray-600">Thành tiền:&nbsp;</span>
          <span className="font-bold text-red-600">
            {o.total.toLocaleString()}đ
          </span>
        </div>
      </div>
    </div>
  );
}
