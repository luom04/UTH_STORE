// src/pages/Cart/CheckoutSuccess.jsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper";
import { PATHS } from "../../routes/paths";
import Button from "../../components/Button/Button";

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1) Lấy object order từ state (flow COD / đặt hàng trực tiếp)
  const orderFromState = location.state?.order || null;

  // 2) Lấy query params (flow VNPay / MoMo quay lại từ cổng thanh toán)
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const successParam = searchParams.get("success"); // "true" | "false" | null
  const methodParam = searchParams.get("method"); // "vnpay" | "momo" | ...
  const orderIdParam = searchParams.get("orderId"); // Mongo _id hoặc mã đơn
  const transactionNoParam = searchParams.get("transactionNo");
  const messageParam = searchParams.get("message") || "";

  // 3) Xác định có phải flow quay lại từ cổng thanh toán không
  const isFromGateway =
    successParam !== null || methodParam !== null || orderIdParam !== null;

  // 4) Xác định trạng thái thành công
  const isSuccess =
    typeof successParam === "string"
      ? successParam === "true"
      : !!orderFromState; // nếu COD qua state thì coi như success

  // 5) Mã đơn ưu tiên: orderNumber -> _id -> orderIdParam -> fallback
  const code =
    orderFromState?.orderNumber ||
    orderFromState?._id ||
    orderIdParam ||
    "ĐH-XXXXXX";

  // 6) Xác định phương thức thô + label hiển thị
  const rawMethod = (
    orderFromState?.paymentMethod ||
    methodParam ||
    "cod"
  ).toLowerCase();

  const methodLabel =
    rawMethod === "vnpay" ? "VNPay" : rawMethod === "momo" ? "MoMo" : "COD";

  const methodDisplay = methodLabel.toUpperCase();

  // 7) Nếu không có state & cũng không phải quay từ cổng thanh toán -> đá về trang chủ
  useEffect(() => {
    if (!orderFromState && !isFromGateway) {
      navigate(PATHS.HOME, { replace: true });
    }
  }, [orderFromState, isFromGateway, navigate]);

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <div className="rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={3} />

        <div className="p-8 text-center space-y-3">
          {/* Icon trạng thái */}
          {isSuccess ? (
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
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}

          {/* Tiêu đề */}
          <div className="text-2xl font-bold">
            {isSuccess ? "Đặt hàng thành công!" : "Thanh toán không thành công"}
          </div>

          {/* Mã đơn & phương thức */}
          <p className="text-gray-600">
            Mã đơn của bạn:{" "}
            <span className="font-semibold text-red-600">{code}</span> — phương
            thức: <span className="uppercase">{methodDisplay}</span>
          </p>

          {/* Thông báo theo từng phương thức + trạng thái */}
          {isSuccess ? (
            // ✅ Thành công
            rawMethod === "cod" ? (
              <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded-lg">
                Đơn hàng đã được tạo thành công và đang chờ xác nhận. Vui lòng
                chú ý điện thoại, nhân viên sẽ liên hệ để xác nhận đơn.
              </p>
            ) : rawMethod === "vnpay" ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                Thanh toán online qua <strong>VNPay</strong> đã được thực hiện.
                Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.
                {transactionNoParam && (
                  <>
                    <br />
                    Mã giao dịch:{" "}
                    <span className="font-mono font-semibold">
                      {transactionNoParam}
                    </span>
                  </>
                )}
              </p>
            ) : rawMethod === "momo" ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                Thanh toán online qua <strong>MoMo</strong> đã được thực hiện.
                Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.
                {transactionNoParam && (
                  <>
                    <br />
                    Mã giao dịch:{" "}
                    <span className="font-mono font-semibold">
                      {transactionNoParam}
                    </span>
                  </>
                )}
              </p>
            ) : (
              <p className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                Đơn hàng đã được tạo thành công.
              </p>
            )
          ) : (
            // ❌ Thất bại
            <p className="text-sm text-red-700 bg-red-50 p-2 rounded-lg">
              {`Thanh toán${methodLabel ? " " + methodLabel : ""} thất bại.`}
              {messageParam && (
                <>
                  <br />
                  Lý do: <span className="font-medium">{messageParam}</span>
                </>
              )}
              {!messageParam && (
                <>
                  <br />
                  Nếu tiền đã bị trừ khỏi tài khoản, vui lòng liên hệ bộ phận hỗ
                  trợ để được kiểm tra.
                </>
              )}
            </p>
          )}

          {/* Action button */}
          <div className="pt-4 flex justify-center space-x-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(PATHS.HOME)}
            >
              Về trang chủ
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(PATHS.ACCOUNT_ORDERS)}
            >
              Xem lịch sử đơn hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
