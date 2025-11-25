// src/Features/Admin/pages/OrdersPage.jsx
import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge.jsx";
import OrderRowActions from "../components/OrderRowActions.jsx";
import OrderStatsChart from "../components/OrderStatsChart.jsx";
import {
  useAdminOrders,
  useAdminUpdateOrderStatus,
} from "../../../hooks/useOrders.js";
import { printOrderInvoice } from "../utils/printOrder.js";
import OrderQuickViewModal from "../components/OrderQuickViewModal.jsx";

const STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "canceled", label: "Đã hủy" },
];

const RANGE_DAYS = [
  { value: 7, label: "7 ngày" },
  { value: 14, label: "14 ngày" },
  { value: 30, label: "30 ngày" },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [rangeDays, setRangeDays] = useState(7);

  // ✅ Quick view modal
  const [quickOrder, setQuickOrder] = useState(null);

  // Gọi API admin
  const { data, isLoading, isError } = useAdminOrders({
    page,
    limit: 20,
    status: status || undefined,
    q: q || undefined,
    days: rangeDays,
  });

  const updateStatusMut = useAdminUpdateOrderStatus();

  const list = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 20,
    total: list.length,
    totalPages: 1,
  };

  const rows = useMemo(
    () =>
      list.map((o, index) => {
        const items = Array.isArray(o.items) ? o.items : [];
        const firstItem = items[0];
        const extraCount = items.length - 1;

        // ✅ Ưu tiên shippingAddress.fullName, fallback fullname (đơn cũ), rồi tới user.name
        const customerName =
          o.shippingAddress?.fullName ||
          o.shippingAddress?.fullname ||
          o.user?.name ||
          "-";

        const customerPhone = o.shippingAddress?.phone || o.user?.phone || "-";

        // ✅ Tổng số lượng sản phẩm
        const itemsCount = items.reduce(
          (sum, item) => sum + (item.qty || 0),
          0
        );

        const rowKey = o._id || o.id || o.orderNumber || index;

        return (
          <tr key={rowKey} className="border-b">
            {/* Mã đơn */}
            <td className="px-3 py-2 font-medium">
              {o.orderNumber || o.code || o._id || o.id}
            </td>

            {/* Khách hàng */}
            <td className="px-3 py-2">
              <div className="font-medium">{customerName}</div>
              <div className="text-xs text-gray-500">{customerPhone}</div>
            </td>

            {/* SL */}
            <td className="px-3 py-2">{itemsCount}</td>

            {/* Tổng tiền */}
            <td className="px-3 py-2 font-semibold text-red-600">
              {(o.grandTotal || o.total || 0).toLocaleString()}đ
            </td>

            {/* Trạng thái */}
            <td className="px-3 py-2">
              <OrderStatusBadge status={o.status} />
              {o.status === "canceled" && (
                <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                  <div>
                    Hủy bởi:{" "}
                    <span className="font-medium">
                      {o.canceledByType === "customer"
                        ? "Khách hàng"
                        : o.canceledByType === "admin"
                        ? "Store"
                        : o.canceledByType === "system"
                        ? "Hệ thống"
                        : "Không rõ"}
                    </span>
                  </div>

                  {o.cancelReason && (
                    <div className="line-clamp-1" title={o.cancelReason}>
                      Lý do: {o.cancelReason}
                    </div>
                  )}
                </div>
              )}
            </td>

            {/* Tạo lúc */}
            <td className="px-3 py-2 text-sm text-gray-500">
              {o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : ""}
            </td>

            {/* ✅ Xem nhanh */}
            <td className="px-3 py-2">
              <button
                type="button"
                onClick={() => setQuickOrder(o)}
                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Eye size={14} />
                Xem
              </button>
            </td>

            {/* Thao tác */}
            <td className="px-3 py-2">
              <OrderRowActions
                currentStatus={o.status}
                disabled={updateStatusMut.isPending}
                onChangeStatus={(nextStatus, note) => {
                  updateStatusMut.mutate({
                    orderId: o._id || o.id,
                    status: nextStatus,
                    note: note,
                  });
                }}
                onPrint={() => printOrderInvoice(o)}
                cancelReason={o.cancelReason}
                canceledByType={o.canceledByType}
              />
            </td>
          </tr>
        );
      }),
    [list, updateStatusMut.isPending]
  );

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý đơn hàng
      </h1>

      <OrderStatsChart />

      {/* ✅ Bộ lọc */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full rounded-lg border px-3 py-2 pr-9"
              placeholder="Tìm theo mã đơn, tên, SĐT..."
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

        {/* filter status */}
        <select
          className="rounded-lg border px-3 py-2 w-full md:w-52"
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

        {/* ✅ filter days */}
        <select
          className="rounded-lg border px-3 py-2 w-full md:w-40"
          value={rangeDays}
          onChange={(e) => {
            setRangeDays(Number(e.target.value));
            setPage(1);
          }}
        >
          {RANGE_DAYS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng */}
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="px-3 py-2 text-left">Mã đơn</th>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left">SL</th>
              <th className="px-3 py-2 text-left">Tổng tiền</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Tạo lúc</th>
              <th className="px-3 py-2 text-left">Xem nhanh</th>
              <th className="px-3 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-8 text-center" colSpan={8}>
                  Đang tải…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-3 py-8 text-center text-rose-600" colSpan={8}>
                  Không tải được dữ liệu
                </td>
              </tr>
            ) : rows.length ? (
              rows
            ) : (
              <tr>
                <td className="px-3 py-8 text-center text-gray-500" colSpan={8}>
                  Chưa có đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Trang trước
        </button>
        <div className="text-sm text-gray-600">
          Trang {meta.page} / {meta.totalPages || 1}
        </div>
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (meta.totalPages || 1)}
        >
          Trang sau
        </button>
      </div>

      <OrderQuickViewModal
        open={!!quickOrder}
        order={quickOrder}
        onClose={() => setQuickOrder(null)}
        onPrint={() => printOrderInvoice(quickOrder)}
      />
    </div>
  );
}
