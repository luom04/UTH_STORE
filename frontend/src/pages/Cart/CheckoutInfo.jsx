// src/pages/Cart/CheckoutInfo.jsx

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper.jsx";
import AddressSelect from "../../components/Checkout/AddressSelect.jsx";
import AddressSelector from "../../components/Checkout/AddressSelector.jsx";
// ⬇️ BƯỚC 1: SỬA IMPORT - Dùng hook API giống như Cart.jsx
import { useCart } from "../../hooks/useCart";
import { ChevronLeft } from "lucide-react";
import Button from "../../components/Button/Button.jsx";
import useAddresses from "../../hooks/useAddresses.js";
import { PATHS } from "../../routes/paths.jsx";

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

// Hàm chuyển đổi format địa chỉ từ API sang format của form
const addressFromApiToForm = (apiAddress) => ({
  province: apiAddress.province,
  district: apiAddress.district,
  ward: apiAddress.ward,
  address: apiAddress.address || "",
});

export default function CheckoutInfo() {
  const navigate = useNavigate();

  // ⬇️ BƯỚC 2: SỬA CÁCH GỌI HOOK
  // Lấy giỏ hàng từ API hook (giống Cart.jsx và CheckoutPayment.jsx)
  const { cart, isLoading: cartLoading } = useCart();
  const items = cart?.items || [];
  const total = cart?.grandTotal || 0;
  const hasCart = items.length > 0;
  // ⬆️ KẾT THÚC SỬA

  const prefilled = usePrefilledUser();

  const { defaultAddress, loading: loadingAddresses } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Khởi tạo state (Giữ nguyên)
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("checkout_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedAddressId(parsed.id || null);
        return {
          id: parsed.id || null,
          name: parsed.name || prefilled.name,
          phone: parsed.phone || prefilled.phone,
          address: parsed.address || { ...addressFromApiToForm({}) },
          note: parsed.note || "",
        };
      }
    } catch (err) {
      console.error("Error loading saved checkout info:", err);
    }
    return {
      id: null,
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

  // Effect: Xử lý địa chỉ mặc định (Giữ nguyên)
  useEffect(() => {
    if (
      defaultAddress &&
      !form.id &&
      !form.address.province &&
      !loadingAddresses
    ) {
      setForm((f) => ({
        ...f,
        id: defaultAddress.id,
        name: defaultAddress.fullname || f.name,
        phone: defaultAddress.phone || f.phone,
        address: addressFromApiToForm(defaultAddress),
      }));
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress, loadingAddresses]);

  // Tự động lưu vào sessionStorage (Giữ nguyên)
  useEffect(() => {
    if (form.name || form.phone || form.address.address || form.note) {
      sessionStorage.setItem("checkout_info", JSON.stringify(form));
    }
  }, [form]);

  // Xử lý khi chọn địa chỉ đã lưu (Giữ nguyên)
  const handleAddressSelect = useCallback((address) => {
    setSelectedAddressId(address.id);
    const newAddressDetails = addressFromApiToForm(address);
    setForm((f) => ({
      ...f,
      id: address.id,
      name: address.fullname,
      phone: address.phone,
      address: newAddressDetails,
    }));
  }, []);

  // Xử lý khi người dùng chỉnh sửa TÊN/SĐT/NOTE
  const handleFieldChange = useCallback((field, value) => {
    setSelectedAddressId(null);
    setForm((f) => ({
      ...f,
      id: null,
      [field]: value,
    }));
  }, []);

  // Xử lý khi AddressSelect (Tỉnh/Quận/Phường) thay đổi
  const handleAddressDetailChange = useCallback((addr) => {
    setSelectedAddressId(null);
    setForm((f) => ({
      ...f,
      id: null,
      address: addr,
    }));
  }, []);

  // Xử lý thay đổi Số nhà/Tên đường
  const handleAddressLineChange = useCallback((value) => {
    setSelectedAddressId(null);
    setForm((f) => ({
      ...f,
      id: null,
      address: {
        ...f.address,
        address: value,
      },
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasCart) return;

    // Validation logic (Giữ nguyên)
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

    sessionStorage.setItem("checkout_info", JSON.stringify(form));
    navigate(`${PATHS.CHECKOUT_PAYMENT}`);
  };

  // ⬇️ BƯỚC 3: THÊM LOADING STATE
  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10 text-center">
        Đang tải giỏ hàng...
      </div>
    );
  }
  // ⬆️ KẾT THÚC THÊM

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <Link
        to={PATHS.CART}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ChevronLeft size={16} /> Trở về
      </Link>

      <div className="mt-4 rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={1} />

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* ⬇️ BƯỚC 4: Logic 'hasCart' SẼ TỰ ĐỘNG ĐÚNG
            (Vì 'hasCart' đã được lấy từ hook API)
          */}
          {!hasCart ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800">
              Giỏ hàng trống.{" "}
              <Link className="underline" to={PATHS.HOME}>
                Về trang chủ
              </Link>
            </div>
          ) : null}

          {/* Hiển thị danh sách địa chỉ đã lưu */}
          <AddressSelector
            selectedId={selectedAddressId}
            onSelect={handleAddressSelect}
          />

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
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
              />
            </div>
          </section>

          {/* Địa chỉ nhận hàng */}
          <section>
            <h3 className="text-base font-semibold mb-3">Địa chỉ nhận hàng</h3>

            {/* Tỉnh/Quận/Phường */}
            <AddressSelect
              value={form.address}
              onChange={handleAddressDetailChange}
            />

            {/* Input Số nhà, tên đường */}
            <input
              className="mt-3 w-full rounded-lg border px-3 py-2"
              placeholder="Số nhà, tên đường"
              value={form.address.address}
              onChange={(e) => handleAddressLineChange(e.target.value)}
            />
          </section>

          {/* Ghi chú */}
          <section>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
              placeholder="Lưu ý, yêu cầu khác (Không bắt buộc)"
              value={form.note}
              onChange={(e) => handleFieldChange("note", e.target.value)}
            />
          </section>

          {/* Tổng & CTA (Giữ nguyên) */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-lg">
              <span className="text-gray-600">Tổng tiền:&nbsp;</span>
              {/* ⬇️ BƯỚC 5: Biến 'total' SẼ TỰ ĐỘNG ĐÚNG
                (Vì 'total' đã được lấy từ hook API)
              */}
              <span className="font-bold text-red-600">
                {total.toLocaleString()}đ
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!hasCart}
              className="h-auto"
            >
              ĐẶT HÀNG NGAY
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Bạn có thể chọn hình thức thanh toán sau khi đặt hàng.
          </p>
        </form>
      </div>
    </div>
  );
}
