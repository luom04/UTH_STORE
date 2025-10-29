// src/Features/Admin/components/OrderStatusBadge.jsx
export default function OrderStatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipping: "bg-sky-100 text-sky-800",
    delivered: "bg-emerald-100 text-emerald-800",
    canceled: "bg-rose-100 text-rose-800",
  };
  const label =
    {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      canceled: "Đã hủy",
    }[status] || status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {label}
    </span>
  );
}
