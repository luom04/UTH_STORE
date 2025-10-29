// src/components/Checkout/CheckoutStepper.jsx
import React from "react";

const STEPS = ["Giỏ hàng", "Thông tin đặt hàng", "Thanh toán", "Hoàn tất"];

export default function CheckoutStepper({ active = 0 }) {
  return (
    <div className="grid grid-cols-4 text-center text-sm">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={[
            "py-4 border-b-2",
            i === active
              ? "font-semibold text-red-600 border-red-600"
              : "text-gray-400 border-transparent",
          ].join(" ")}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
