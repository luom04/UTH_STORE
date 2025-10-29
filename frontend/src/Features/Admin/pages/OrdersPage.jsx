// src/Features/Admin/pages/OrdersPage.jsx
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { fetchOrders, updateOrderStatus, confirmOrder } from "../../api/orders";
import { Search } from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge.jsx";
import OrderRowActions from "../components/OrderRowActions.jsx";

const STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "canceled", label: "Đã hủy" },
];

// Fallback nếu BE chưa có: mảng demo
const MOCK = {
  success: true,
  data: [
    {
      id: "O1001",
      code: "O1001",
      customer: { name: "Nguyễn Văn A", phone: "0900000001" },
      total: 35990000,
      status: "pending",
      itemsCount: 2,
      createdAt: "2025-10-20T09:00:00.000Z",
    },
    {
      id: "O1002",
      code: "O1002",
      customer: { name: "Trần Thị B", phone: "0900000002" },
      total: 12990000,
      status: "shipping",
      itemsCount: 1,
      createdAt: "2025-10-19T12:30:00.000Z",
    },
  ],
  meta: { page: 1, limit: 20, total: 2 },
};

export default function OrdersPage() {
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminOrders", { page, status, q }],
    queryFn: async () => {
      try {
        const r = await fetchOrders({ page, limit: 20, status, q });
        return r;
      } catch {
        // fallback mock để bạn xem UI ngay
        return MOCK;
      }
    },
    keepPreviousData: true,
  });

  const confirmMut = useMutation({
    mutationFn: (id) => confirmOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOrders"] }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, next }) => updateOrderStatus(id, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOrders"] }),
  });

  const list = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: list.length };

  const nextStatus = (current) => {
    const chain = [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
    ];
    const i = chain.indexOf(current);
    if (i >= 0 && i < chain.length - 1) return chain[i + 1];
    return null;
  };

  const onPrint = (order) => {
    // mở popup in đơn giản: có thể thay bằng template đẹp sau
    const html = `
      <html><head><title>Print ${order.code}</title></head>
      <body>
        <h3>Hóa đơn: ${order.code}</h3>
        <p>Khách: ${order.customer?.name} - ${order.customer?.phone}</p>
        <p>SL sản phẩm: ${order.itemsCount}</p>
        <p>Tổng tiền: ${order.total.toLocaleString()}đ</p>
        <p>Trạng thái: ${order.status}</p>
        <hr/>
        <small>In từ UTH Store Admin</small>
        <script>window.print(); setTimeout(()=>window.close(), 300);</script>
      </body></html>`;
    const w = window.open("", "_blank", "width=800,height=600");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const rows = useMemo(
    () =>
      list.map((o) => {
        const canConfirm = o.status === "pending";
        const canAdvance = !!nextStatus(o.status);
        return (
          <tr key={o.id} className="border-b">
            <td className="px-3 py-2 font-medium">{o.code}</td>
            <td className="px-3 py-2">
              <div className="font-medium">{o.customer?.name || "-"}</div>
              <div className="text-xs text-gray-500">{o.customer?.phone}</div>
            </td>
            <td className="px-3 py-2">{o.itemsCount}</td>
            <td className="px-3 py-2 font-semibold text-red-600">
              {o.total.toLocaleString()}đ
            </td>
            <td className="px-3 py-2">
              <OrderStatusBadge status={o.status} />
            </td>
            <td className="px-3 py-2 text-sm text-gray-500">
              {new Date(o.createdAt).toLocaleString()}
            </td>
            <td className="px-3 py-2">
              <OrderRowActions
                canConfirm={canConfirm && !confirmMut.isLoading}
                canAdvance={canAdvance && !updateStatusMut.isLoading}
                onConfirm={() => confirmMut.mutate(o.id)}
                onAdvance={() => {
                  const next = nextStatus(o.status);
                  if (next) updateStatusMut.mutate({ id: o.id, next });
                }}
                onPrint={() => onPrint(o)}
              />
            </td>
          </tr>
        );
      }),
    [list, confirmMut.isLoading, updateStatusMut.isLoading]
  );

  return (
    <div>
      <h1 className=" text-xl font-bold mb-4">Quản lý đơn hàng</h1>

      {/* Bộ lọc */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full rounded-lg border px-3 py-2 pr-9"
              placeholder="Tìm theo mã đơn, tên, SĐT..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
        <select
          className="rounded-lg border px-3 py-2 w-full md:w-56"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng */}
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="min-w-[840px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="px-3 py-2 text-left">Mã đơn</th>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left">SL</th>
              <th className="px-3 py-2 text-left">Tổng tiền</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Tạo lúc</th>
              <th className="px-3 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-8 text-center" colSpan={7}>
                  Đang tải…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-3 py-8 text-center text-rose-600" colSpan={7}>
                  Không tải được dữ liệu
                </td>
              </tr>
            ) : rows.length ? (
              rows
            ) : (
              <tr>
                <td className="px-3 py-8 text-center text-gray-500" colSpan={7}>
                  Chưa có đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang đơn giản */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Trang trước
        </button>
        <div className="text-sm text-gray-600">Trang {meta.page}</div>
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={list.length < (meta.limit || 20)}
        >
          Trang sau
        </button>
      </div>

      {/* Chú thích quyền */}
      <p className="mt-3 text-xs text-gray-500">
        * Nhân viên và quản trị cùng xem được trang này. Riêng mục “Quản lý nhân
        viên” chỉ hiển thị ở DashboardAdmin khi role là <b>admin</b>.
      </p>
    </div>
  );
}
