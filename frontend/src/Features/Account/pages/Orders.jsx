// src/Features/Account/pages/Orders.jsx
import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import SegmentTabs from "../components/SegmentTabs.jsx";
import OrderCard from "../components/OrderCard.jsx";
import OrdersEmpty from "../components/OrdersEmpty.jsx";
import { useMyOrders } from "../../../hooks/useOrders.js";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang vận chuyển" },
  { key: "completed", label: "Hoàn thành" },
  { key: "canceled", label: "Đã hủy" },
];

export default function Orders() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const statusParam = tab === "all" ? undefined : tab;

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [q]);

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useMyOrders({
    status: statusParam,
    limit: 50,
  });

  // Lọc theo mã đơn HOẶC tên sản phẩm
  const filtered = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    let data = orders;

    if (debouncedQ.trim()) {
      const k = debouncedQ.trim().toLowerCase();

      data = data.filter((order) => {
        // 1. Check mã đơn hàng
        const matchesOrderNumber = (order.orderNumber || "")
          .toLowerCase()
          .includes(k);
        if (matchesOrderNumber) {
          return true;
        }

        // 2. Check tên sản phẩm (trong mảng items)
        if (Array.isArray(order.items)) {
          const matchesProductTitle = order.items.some((item) =>
            (item.title || "").toLowerCase().includes(k)
          );
          if (matchesProductTitle) {
            return true;
          }
        }

        return false;
      });
    }

    return data;
  }, [orders, debouncedQ]); // Lọc theo `debouncedQ`

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <SegmentTabs value={tab} onChange={setTab} tabs={TABS} />

      {/* Ô tìm kiếm */}
      <div className="px-4 py-3 ">
        <div className="relative">
          <input
            className="w-full h-11 rounded-lg border px-3 pl-10"
            // THAY ĐỔI 1: Cập nhật placeholder
            placeholder="Tìm theo Mã đơn hàng hoặc Tên sản phẩm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
        </div>
      </div>

      {/* Danh sách đơn */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Đang tải đơn hàng…
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-rose-500">
            Không tải được danh sách đơn hàng. Vui lòng thử lại sau.
          </div>
        ) : filtered.length === 0 ? (
          <OrdersEmpty />
        ) : (
          filtered.map((o) => <OrderCard key={o._id || o.orderNumber} o={o} />)
        )}
      </div>
    </div>
  );
}
