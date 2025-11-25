import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate
import CheckoutStepper from "../../components/Checkout/CheckoutStepper"; // Bỏ .jsx
import { PATHS } from "../../routes/paths"; // Bỏ .jsx
import Button from "../../components/Button/Button"; // Bỏ .jsx

export default function CheckoutSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate(); // Khai báo useNavigate

  // Lấy toàn bộ object order từ state
  const order = state?.order;

  // Đọc các trường cần thiết từ object order
  // Thay thế orderCode bằng order.orderNumber
  // Thay thế method bằng order.paymentMethod
  const code = order?.orderNumber || "ĐH-XXXXXX";
  const method = order?.paymentMethod || "cod";

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <div className="rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={3} />
        <div className="p-8 text-center space-y-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.793-1.793a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4.5-4.5z"
              clipRule="evenodd"
            />
          </svg>

          <div className="text-2xl font-bold">Đặt hàng thành công!</div>
          <p className="text-gray-600">
            Mã đơn của bạn:{" "}
            <span className="font-semibold text-red-600">{code}</span> — phương
            thức: <span className="uppercase">{method}</span>
          </p>
          {/* Thông báo bổ sung cho thanh toán online */}
          {method !== "cod" && (
            <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded-lg">
              Đơn hàng đang chờ thanh toán. Vui lòng hoàn tất thanh toán để được
              xác nhận.
            </p>
          )}

          <div className="pt-4 flex justify-center space-x-3">
            {/* Sử dụng Button cho Về trang chủ */}
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(PATHS.HOME)}
            >
              Về trang chủ
            </Button>

            {/* Sử dụng Button cho Xem lịch sử đơn hàng */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(`${PATHS.ACCOUNT_ORDERS}`)}
            >
              Xem lịch sử đơn hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
