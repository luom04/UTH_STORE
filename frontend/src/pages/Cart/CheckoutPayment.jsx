// src/pages/Cart/CheckoutPayment.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper.jsx";
import { useCart } from "../../components/Cart/CartContext.jsx";
import { ChevronLeft } from "lucide-react";

function formatAddress(addr) {
  if (!addr) return "";
  const bits = [
    addr.address,
    addr.ward?.name,
    addr.district?.name,
    addr.province?.name,
  ].filter(Boolean);
  return bits.join(", ");
}

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const info = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("checkout_info") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [method, setMethod] = useState("cod"); // cod | bank | wallet

  const placeOrder = () => {
    if (!items.length) {
      navigate("/cart");
      return;
    }
    // TODO: Gọi API tạo đơn ở đây
    // mock: clear cart + điều hướng trang hoàn tất
    clear?.();
    navigate("/checkout/success", {
      state: {
        orderCode: "DH" + Date.now().toString().slice(-6),
        method,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <Link
        to="/checkout/info"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ChevronLeft size={16} /> Quay lại thông tin đặt hàng
      </Link>

      <div className="mt-4 rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          {/* Cột trái: phương thức thanh toán */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-semibold">
              Chọn phương thức thanh toán
            </h3>

            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="cod"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
                className="mt-1"
              />
              <div>
                <div className="font-medium">
                  Thanh toán khi nhận hàng (COD)
                </div>
                <p className="text-sm text-gray-600">
                  Nhân viên giao hàng sẽ thu tiền mặt hoặc quẹt thẻ (nếu hỗ trợ)
                  khi giao hàng.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="bank"
                checked={method === "bank"}
                onChange={() => setMethod("bank")}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Chuyển khoản ngân hàng</div>
                <p className="text-sm text-gray-600">
                  Sau khi đặt hàng, bạn sẽ nhận thông tin STK để chuyển khoản
                  (nội dung: mã đơn).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="wallet"
                checked={method === "wallet"}
                onChange={() => setMethod("wallet")}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Ví điện tử (Momo/ZaloPay)</div>
                <p className="text-sm text-gray-600">
                  Chúng tôi sẽ hiển thị mã QR hoặc deep-link để bạn thanh toán
                  nhanh chóng.
                </p>
              </div>
            </label>
          </section>

          {/* Cột phải: tóm tắt */}
          <aside className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="font-semibold mb-2">Tóm tắt đơn hàng</div>
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 text-sm">
                      <div className="line-clamp-2">{it.title}</div>
                      <div className="text-gray-500">x{it.qty}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {(it.price * it.qty).toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t pt-3 flex items-center justify-between">
                <span>Tổng tiền</span>
                <span className="text-lg font-bold text-red-600">
                  {total.toLocaleString()}đ
                </span>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="font-semibold mb-2">Địa chỉ nhận hàng</div>
              {info?.name || info?.phone ? (
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Khách:</span> {info.name}
                  </div>
                  <div>
                    <span className="font-medium">Điện thoại:</span>{" "}
                    {info.phone}
                  </div>
                  <div>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {formatAddress(info.address)}
                  </div>
                  {info.note ? (
                    <div>
                      <span className="font-medium">Ghi chú:</span> {info.note}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Thiếu thông tin.{" "}
                  <Link to="/checkout/info" className="underline">
                    Cập nhật ngay
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={placeOrder}
              disabled={!items.length}
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              XÁC NHẬN ĐẶT HÀNG
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
