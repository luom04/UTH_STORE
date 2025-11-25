// src/pages/Cart.jsx

import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { Minus, Plus, Trash2, ChevronLeft, Gift } from "lucide-react";
import { PATHS } from "../../routes/paths";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper";
import Button from "../../components/Button/Button"; // Import Button component

export default function Cart() {
  // Giả sử useCart trả về các hàm bất đồng bộ
  const { cart, isLoading, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  // State cục bộ để theo dõi các item đang được cập nhật (Optimistic)
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  /**
   * Xử lý cập nhật số lượng sản phẩm một cách lạc quan (optimistic update)
   * @param {string} itemId ID sản phẩm
   * @param {number} newQty Số lượng mới
   * @param {number} stock Số lượng tồn kho
   */
  const handleUpdateQty = async (itemId, newQty, stock) => {
    // 1. Kiểm tra giới hạn số lượng
    const safeQty = Math.min(Math.max(1, newQty), stock);
    if (safeQty === cart.items.find((i) => i.id === itemId)?.qty) return;

    // Lấy thông tin item cũ
    const oldItem = cart.items.find((i) => i.id === itemId);
    const oldQty = oldItem ? oldItem.qty : safeQty;

    // 2. OPTIMISTIC: Cập nhật state cục bộ để vô hiệu hóa nút (tránh spam)
    setOptimisticUpdates((prev) => ({
      ...prev,
      [itemId]: { isUpdating: true, prevQty: oldQty },
    }));

    try {
      // 3. Gọi hàm cập nhật từ hook (Giả định hook sẽ cập nhật UI chung)
      await updateQty({ itemId, qty: safeQty });
    } catch (error) {
      // 4. ROLLBACK: Nếu có lỗi, hiển thị lỗi và không làm gì cả
      console.error("Cập nhật số lượng thất bại, đang hoàn tác:", error);
    } finally {
      // 5. Loại bỏ trạng thái updating sau khi hoàn thành
      setOptimisticUpdates((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10 text-center">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10">
        <Link
          to={PATHS.HOME}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} /> Mua thêm sản phẩm khác
        </Link>
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold">Giỏ hàng của bạn đang trống</p>
          <Button
            variant="primary"
            size="md"
            className="mt-4"
            onClick={() => navigate(PATHS.HOME)}
          >
            Về Trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <Link
        to={PATHS.HOME}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ChevronLeft size={16} /> Mua thêm sản phẩm khác
      </Link>

      <div className="mt-4 rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={0} />

        {/* List items */}
        <div className="p-4 divide-y">
          {cart.items.map((item) => {
            const isUpdating = optimisticUpdates[item.id]?.isUpdating || false;
            // ✅ giftsList là mảng
            const giftsList = Array.isArray(item.gifts) ? item.gifts : [];
            const hasGifts = giftsList.length > 0;

            const studentDiscount = Number(item.studentDiscountAmount || 0);
            const hasStudentDiscount = studentDiscount > 0;

            return (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-md bg-gray-50"
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-2">{item.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Còn {item.stock} sản phẩm
                  </div>

                  {/* ✅ NEW: Hiển thị quà tặng */}

                  {hasStudentDiscount && (
                    <div className="text-gray-700">
                      <span className="font-semibold text-red-700">
                        🎓 Ưu đãi HSSV:
                      </span>{" "}
                      Giảm thêm {studentDiscount.toLocaleString()}đ
                      <span className="text-gray-500">
                        {" "}
                        (áp dụng khi xác thực{" "}
                        <Link
                          to={PATHS.PROFILE}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          HSSV
                        </Link>{" "}
                        )
                      </span>
                    </div>
                  )}

                  {hasGifts && (
                    <div className="mt-2 rounded-md bg-red-50 border border-red-100 p-2 text-xs">
                      <div className="font-semibold text-red-700 flex items-center gap-1">
                        <Gift size={12} />
                        Quà tặng kèm:
                      </div>

                      <ul className="mt-1 space-y-0.5">
                        {giftsList.map((g, idx) => (
                          <li key={idx} className="text-gray-700">
                            🎁 {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* ⬇️ SỬA NÚT XOÁ ⬇️ */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 p-0 h-auto text-xs text-gray-500 hover:text-red-600" // Xóa class màu
                    onClick={() => removeItem(item.id)}
                    startIcon={<Trash2 size={14} />}
                    disabled={isUpdating}
                  >
                    Xoá
                  </Button>
                  {/* ⬆️ KẾT THÚC SỬA ⬆️ */}
                </div>

                <div className="hidden sm:block w-32 text-right">
                  <div className="font-semibold text-red-600">
                    {item.price.toLocaleString()}đ
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    = {item.subtotal.toLocaleString()}đ
                  </div>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-8 w-8 !p-0 grid place-items-center text-gray-700 dark:text-white"
                    onClick={() =>
                      handleUpdateQty(item.id, item.qty - 1, item.stock)
                    }
                    disabled={item.qty <= 1 || isUpdating}
                  >
                    <Minus size={14} />
                  </Button>

                  <input
                    className="h-8 w-12 rounded border text-center"
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.qty}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 1;
                      handleUpdateQty(item.id, newQty, item.stock);
                    }}
                    disabled={isUpdating}
                  />

                  <Button
                    variant="secondary"
                    className="h-8 w-8 !p-0 grid place-items-center text-gray-700 dark:text-white"
                    onClick={() =>
                      handleUpdateQty(item.id, item.qty + 1, item.stock)
                    }
                    disabled={item.qty >= item.stock || isUpdating}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t space-y-2">
          {/* Tạm tính (Giữ nguyên) */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Tạm tính ({cart.itemCount} sản phẩm):
            </span>
            <span className="font-semibold">
              {cart.itemsTotal.toLocaleString()}đ
            </span>
          </div>

          {/* Phí vận chuyển (Giữ nguyên) */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-semibold">
              {cart.shippingFee === 0
                ? "Miễn phí"
                : `${cart.shippingFee.toLocaleString()}đ`}
            </span>
          </div>

          {/* Bọc "Tổng cộng" và "Button" trong một div flex */}
          <div className="flex justify-between items-center pt-2 border-t">
            {/* 1. Khối "Tổng cộng" */}
            <div className="text-lg">
              <span className="text-gray-600">Tổng cộng: </span>
              <span className="font-bold text-red-600">
                {cart.grandTotal.toLocaleString()}đ
              </span>
            </div>

            {/* 2. Nút "ĐẶT HÀNG NGAY" */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(PATHS.CHECKOUT_INFO)}
              className="" // Đã xóa "w-full mt-4"
            >
              ĐẶT HÀNG NGAY
            </Button>
          </div>
        </div>
        {/* ⬆️ KẾT THÚC SỬA ⬆️ */}
      </div>
    </div>
  );
}
