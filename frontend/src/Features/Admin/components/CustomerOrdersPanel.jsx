import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// import { fetchCustomerOrders } from "../api/customers";
import { X } from "lucide-react";

function StatusBadge({ s }) {
  const map = {
    pending: ["bg-amber-50 text-amber-700", "Chờ xác nhận"],
    confirmed: ["bg-blue-50 text-blue-700", "Đã xác nhận"],
    processing: ["bg-sky-50 text-sky-700", "Đang xử lý"],
    shipping: ["bg-indigo-50 text-indigo-700", "Đang giao"],
    delivered: ["bg-emerald-50 text-emerald-700", "Đã giao"],
    canceled: ["bg-rose-50 text-rose-700", "Đã hủy"],
  };
  const [cls, label] = map[s] || ["bg-gray-100 text-gray-700", s || "-"];
  return (
    <span className={`px-2 py-[2px] rounded-full text-xs ${cls}`}>{label}</span>
  );
}

export default function CustomerOrdersPanel({ open, onClose, customer }) {
  // lock scroll khi mở panel (nhẹ nhàng)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const customerId = customer?.id;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCustomerOrders", { customerId, page: 1 }],
    queryFn: () => fetchCustomerOrders({ customerId, page: 1, limit: 10 }),
    enabled: open && !!customerId,
  });

  const list = data?.data || [];
  const totalSpent = list.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div
      className={`fixed inset-0 z-50 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[720px] bg-white shadow-xl
                    transition-transform duration-300 ${
                      open ? "translate-x-0" : "translate-x-full"
                    }`}
      >
        {/* header */}
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div>
            <div className="font-semibold">Lịch sử đơn hàng</div>
            <div className="text-xs text-gray-500">
              {customer?.name} • {customer?.email}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* summary */}
        <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-gray-500">Tổng số đơn</div>
            <div className="font-semibold">{list.length}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-gray-500">Tổng chi tiêu (panel)</div>
            <div className="font-semibold text-red-600">
              {totalSpent.toLocaleString()}đ
            </div>
          </div>
        </div>

        {/* content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-56px-84px)]">
          <div className="rounded-xl border bg-white overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Mã đơn</th>
                  <th className="px-3 py-2 text-left">Ngày tạo</th>
                  <th className="px-3 py-2 text-left">Sản phẩm</th>
                  <th className="px-3 py-2 text-left">Trạng thái</th>
                  <th className="px-3 py-2 text-left">Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-3 py-8 text-center" colSpan={5}>
                      Đang tải…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      className="px-3 py-8 text-center text-rose-600"
                      colSpan={5}
                    >
                      Không tải được dữ liệu
                    </td>
                  </tr>
                ) : list.length ? (
                  list.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="px-3 py-2 font-medium">
                        {/* Nếu có trang chi tiết đơn admin, trỏ tới đó */}
                        <a
                          href={`/admin/orders/${o.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {o.code || o.id}
                        </a>
                      </td>
                      <td className="px-3 py-2">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{o.itemsCount || 0}</td>
                      <td className="px-3 py-2">
                        <StatusBadge s={o.status} />
                      </td>
                      <td className="px-3 py-2 font-semibold text-red-600">
                        {o.total?.toLocaleString()}đ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-3 py-8 text-center text-gray-500"
                      colSpan={5}
                    >
                      Khách hàng chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  );
}
