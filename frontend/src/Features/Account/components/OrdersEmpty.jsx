// src/Features/Account/components/OrdersEmpty.jsx
import { Search } from "lucide-react";

export default function OrdersEmpty() {
  return (
    <div className="rounded-xl bg-white border p-8 text-center text-gray-600">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100">
        <Search size={20} />
      </div>
      Chưa có đơn hàng nào
    </div>
  );
}
