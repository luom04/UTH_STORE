// src/Features/Account/pages/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import SegmentTabs from "../components/SegmentTabs.jsx";
import OrderCard from "../components/OrderCard.jsx";
import OrdersEmpty from "../components/OrdersEmpty.jsx";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang vận chuyển" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Hủy" },
];

const LS_KEY = "uth_orders";

const readOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function Orders() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState(() => readOrders());

  // seed demo 1 đơn lần đầu (xóa nếu không muốn)
  useEffect(() => {
    if (orders.length === 0) {
      const seed = [
        {
          id: "DH1000123",
          createdAt: new Date().toISOString(),
          status: "processing",
          items: [
            {
              id: "p1",
              title: "Laptop gaming MSI Katana 15",
              image:
                "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=400&auto=format&fit=crop",
              qty: 1,
              price: 20990000,
            },
          ],
          total: 20990000,
        },
      ];
      setOrders(seed);
      localStorage.setItem(LS_KEY, JSON.stringify(seed));
    }
  }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    let data = orders;
    if (tab !== "all") data = data.filter((o) => o.status === tab);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      data = data.filter((o) => o.id.toLowerCase().includes(k));
    }
    return data;
  }, [orders, tab, q]);

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <SegmentTabs value={tab} onChange={setTab} tabs={TABS} />

      <div className="px-4 py-3 ">
        <div className="relative">
          <input
            className="w-full h-11 rounded-lg border px-3 pr-24"
            placeholder="Tìm đơn hàng theo Mã đơn hàng"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 rounded-md bg-blue-600 text-white text-sm"
            onClick={() => {}}
          >
            Tìm đơn hàng
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filtered.length === 0 ? (
          <OrdersEmpty />
        ) : (
          filtered.map((o) => <OrderCard key={o.id} o={o} />)
        )}
      </div>
    </div>
  );
}
