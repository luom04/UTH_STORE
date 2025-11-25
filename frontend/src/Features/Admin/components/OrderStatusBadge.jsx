// src/Features/Admin/components/OrderStatusBadge.jsx
import React from "react";

const STATUS_STYLES = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  shipping: {
    label: "Đang giao hàng",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  canceled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  // Bổ sung thêm cho đủ bộ
  unpaid: {
    label: "Chưa thanh toán",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  paid: {
    label: "Đã thanh toán",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

const DEFAULT_STYLE = {
  label: "Không rõ",
  className: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function OrderStatusBadge({ status }) {
  // Chuyển về chữ thường để tránh lỗi case-sensitive
  const normalizedStatus = String(status || "").toLowerCase();

  const style = STATUS_STYLES[normalizedStatus] || DEFAULT_STYLE;
  const label = STATUS_STYLES[normalizedStatus] ? style.label : status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${style.className}`}
    >
      {label}
    </span>
  );
}
