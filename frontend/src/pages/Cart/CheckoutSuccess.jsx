// src/pages/Cart/CheckoutSuccess.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper.jsx";
import { PATHS } from "../../routes/paths.jsx";

export default function CheckoutSuccess() {
  const { state } = useLocation();
  const code = state?.orderCode || "ĐH-XXXXXX";
  const method = state?.method || "cod";

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <div className="rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={3} />
        <div className="p-8 text-center space-y-3">
          <div className="text-2xl font-bold">Đặt hàng thành công!</div>
          <p className="text-gray-600">
            Mã đơn của bạn: <span className="font-semibold">{code}</span> —
            phương thức: <span className="uppercase">{method}</span>
          </p>
          <div className="pt-2 space-x-3">
            <Link
              to={PATHS.HOME}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-white hover:bg-red-700"
            >
              Về trang chủ
            </Link>
            <Link
              to="/orders"
              className="rounded-lg border px-5 py-2.5 hover:bg-gray-50"
            >
              Xem lịch sử đơn hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
