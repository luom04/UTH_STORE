// src/pages/Cart/CheckoutInfo.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper.jsx";
import AddressSelect from "../../components/Checkout/AddressSelect.jsx";
import { useCart } from "../../components/Cart/CartContext.jsx";
import { ChevronLeft } from "lucide-react";

// ví dụ lấy nhanh từ localStorage nếu bạn chưa có AuthContext
function usePrefilledUser() {
  return useMemo(() => {
    const raw = localStorage.getItem("uth_user");
    if (!raw) return { name: "", phone: "" };
    try {
      const u = JSON.parse(raw);
      return { name: u?.name || "", phone: u?.phone || "" };
    } catch {
      return { name: "", phone: "" };
    }
  }, []);
}

export default function CheckoutInfo() {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const prefilled = usePrefilledUser();

  // Khởi tạo state với dữ liệu từ sessionStorage (nếu có) hoặc từ user
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("checkout_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Đảm bảo structure đầy đủ
        return {
          name: parsed.name || prefilled.name,
          phone: parsed.phone || prefilled.phone,
          address: parsed.address || {
            province: null,
            district: null,
            ward: null,
            address: "",
          },
          note: parsed.note || "",
        };
      }
    } catch (err) {
      console.error("Error loading saved checkout info:", err);
    }

    // Nếu không có dữ liệu đã lưu, dùng dữ liệu mặc định
    return {
      name: prefilled.name,
      phone: prefilled.phone,
      address: {
        province: null,
        district: null,
        ward: null,
        address: "",
      },
      note: "",
    };
  });

  const hasCart = items.length > 0;

  // Tự động lưu vào sessionStorage mỗi khi form thay đổi
  useEffect(() => {
    if (form.name || form.phone || form.address.address || form.note) {
      sessionStorage.setItem("checkout_info", JSON.stringify(form));
    }
  }, [form]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasCart) return;

    // very light validation
    if (!form.name?.trim() || !form.phone?.trim()) {
      alert("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }
    if (
      !form.address.province ||
      !form.address.district ||
      !form.address.ward ||
      !form.address.address?.trim()
    ) {
      alert("Vui lòng chọn đầy đủ Tỉnh/Quận/Phường và nhập số nhà, tên đường.");
      return;
    }

    // Lưu vào sessionStorage trước khi chuyển sang trang thanh toán
    sessionStorage.setItem("checkout_info", JSON.stringify(form));

    navigate("/checkout/payment");
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ChevronLeft size={16} /> Trở về
      </Link>

      <div className="mt-4 rounded-xl bg-white shadow-sm">
        {/* Stepper */}
        <CheckoutStepper active={1} />

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {!hasCart ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800">
              Giỏ hàng trống.{" "}
              <Link className="underline" to="/">
                Về trang chủ
              </Link>
            </div>
          ) : null}

          {/* Thông tin khách mua */}
          <section>
            <h3 className="text-base font-semibold mb-3">
              Thông tin khách mua hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Nhập họ tên"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
          </section>

          {/* Địa chỉ nhận hàng */}
          <section>
            <h3 className="text-base font-semibold mb-3">Địa chỉ nhận hàng</h3>
            <AddressSelect
              value={form.address}
              onChange={(addr) => setForm((f) => ({ ...f, address: addr }))}
            />
            <input
              className="mt-3 w-full rounded-lg border px-3 py-2"
              placeholder="Số nhà, tên đường"
              value={form.address.address}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  address: { ...f.address, address: e.target.value },
                }))
              }
            />
          </section>

          {/* Ghi chú */}
          <section>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
              placeholder="Lưu ý, yêu cầu khác (Không bắt buộc)"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </section>

          {/* Tổng & CTA */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-lg">
              <span className="text-gray-600">Tổng tiền:&nbsp;</span>
              <span className="font-bold text-red-600">
                {total.toLocaleString()}đ
              </span>
            </div>

            <button
              type="submit"
              disabled={!hasCart}
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              ĐẶT HÀNG NGAY
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Bạn có thể chọn hình thức thanh toán sau khi đặt hàng.
          </p>
        </form>
      </div>
    </div>
  );
}
