//src/pages/Cart/CheckoutPayment.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useCreateOrder } from "../../hooks/useOrders";
import { useAuth } from "../../contexts/AuthContext";
import { PATHS } from "../../routes/paths";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper";
import Button from "../../components/Button/Button";
import { CreditCard, Wallet, Truck, Check } from "lucide-react";
import toast from "react-hot-toast";

// ✅ Import Component CouponInput
import CouponInput from "../../components/Checkout/CouponInput";

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { cart, isLoading: cartLoading } = useCart();
  const createOrderMutation = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // ✅ State quản lý giảm giá voucher
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  // Lấy địa chỉ từ sessionStorage
  const getShippingAddress = () => {
    try {
      const checkoutInfo = sessionStorage.getItem("checkout_info");
      if (!checkoutInfo) return null;
      const parsed = JSON.parse(checkoutInfo);
      return {
        fullname: parsed.name,
        phone: parsed.phone,
        address: parsed.address.address,
        province: parsed.address.province,
        district: parsed.address.district,
        ward: parsed.address.ward,
      };
    } catch (error) {
      console.error("Error parsing checkout info:", error);
      return null;
    }
  };

  const [shippingAddress, setShippingAddress] = useState(getShippingAddress());

  useEffect(() => {
    const address = getShippingAddress();
    setShippingAddress(address);
    if (!address) {
      toast.error("Vui lòng điền thông tin giao hàng");
      navigate(PATHS.CHECKOUT_INFO);
    }
  }, [navigate]);

  useEffect(() => {
    console.log("🎟️ State mã giảm giá hiện tại:", appliedCode);
  }, [appliedCode]);

  if (!shippingAddress || cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10 text-center text-gray-600">
        Đang tải thông tin...
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold">Giỏ hàng của bạn đang trống</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate(PATHS.HOME)}
          >
            Về Trang chủ
          </Button>
        </div>
      </div>
    );
  }

  // =====================================================
  // ✅ NEW: Tính tổng giảm giá HSSV (nếu user là sinh viên)
  // =====================================================
  const isStudent = !!user?.isStudent;

  const studentDiscountTotal = isStudent
    ? cart.items.reduce((sum, item) => {
        const qty = Number(item.qty) || 0;

        const perUnitDiscount =
          Number(
            item.studentDiscountAmount ??
              item.product?.studentDiscountAmount ??
              0
          ) || 0;

        if (perUnitDiscount <= 0 || qty <= 0) return sum;

        // base price để cap không giảm quá giá
        const basePrice =
          Number(
            item.priceSale ??
              item.price ??
              item.product?.priceSale ??
              item.product?.price
          ) || (qty > 0 ? Number(item.subtotal || 0) / qty : 0);

        const appliedPerUnit = Math.min(perUnitDiscount, basePrice);

        return sum + appliedPerUnit * qty;
      }, 0)
    : 0;

  // Tổng tạm tính sau khi trừ HSSV
  const itemsTotalAfterStudent = Math.max(
    0,
    Number(cart.itemsTotal || 0) - studentDiscountTotal
  );

  // ✅ NEW: shipping fee tính lại theo tổng sau HSSV (đúng với BE)
  const shippingFeeAfterStudent = itemsTotalAfterStudent >= 500000 ? 0 : 40000;

  // Tổng tiền cuối cùng = sau HSSV + ship - voucher
  const finalTotal = Math.max(
    0,
    itemsTotalAfterStudent + shippingFeeAfterStudent - discountAmount
  );

  // Xử lý Đặt hàng
  const handlePlaceOrder = () => {
    const currentAddress = getShippingAddress();
    if (!currentAddress) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      navigate(PATHS.CHECKOUT_INFO);
      return;
    }

    console.log("🚀 Bắt đầu gửi đơn hàng...");
    console.log(" -> Mã gửi đi:", appliedCode);

    createOrderMutation.mutate({
      shippingAddress: currentAddress,
      paymentMethod,
      itemsTotal: cart.itemsTotal,
      couponCode: appliedCode ? appliedCode.toUpperCase() : "",
      note: "",
    });
  };

  const paymentMethods = [
    {
      id: "COD",
      label: "Thanh toán khi nhận hàng (COD)",
      icon: <Truck size={24} />,
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
    },
    {
      id: "BANK_TRANSFER",
      label: "Chuyển khoản ngân hàng",
      icon: <CreditCard size={24} />,
      description: "Chuyển khoản qua tài khoản ngân hàng",
      disabled: true,
    },
    {
      id: "VNPAY",
      label: "Ví điện tử VNPay",
      icon: <Wallet size={24} />,
      description: "Thanh toán qua ví VNPay",
      disabled: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 py-8">
      <div className="rounded-xl bg-white shadow-sm">
        <CheckoutStepper active={2} />

        <div className="p-6 space-y-6">
          {/* Thông tin giao hàng */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                Thông tin giao hàng
              </h3>
              <button
                onClick={() => navigate(PATHS.CHECKOUT_INFO)}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Thay đổi
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">
                {shippingAddress.fullname} | {shippingAddress.phone}
              </p>
              <p>{shippingAddress.address}</p>
              {shippingAddress.ward && (
                <p>
                  {shippingAddress.ward.name}, {shippingAddress.district.name},{" "}
                  {shippingAddress.province.name}
                </p>
              )}
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Sản phẩm ({cart.itemCount})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">SL: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {item.subtotal.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mã ưu đãi */}
          <div className="border rounded-lg p-4 bg-blue-50/30 border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Mã ưu đãi
            </h3>
            <CouponInput
              // ✅ NEW: orderTotal sau khi trừ HSSV (đúng chuẩn BE)
              orderTotal={itemsTotalAfterStudent}
              onApply={(res) => {
                if (res) {
                  console.log("✅ Đã áp dụng mã:", res.code);
                  setDiscountAmount(res.discountAmount);
                  setAppliedCode(res.code);
                } else {
                  console.log("❌ Đã gỡ mã");
                  setDiscountAmount(0);
                  setAppliedCode("");
                }
              }}
            />
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Phương thức thanh toán
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={method.disabled}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                      {method.disabled && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                          Sắp có
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {method.description}
                    </p>
                  </div>
                  {paymentMethod === method.id && (
                    <Check size={20} className="text-blue-600 mt-1" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">
                {cart.itemsTotal.toLocaleString()}đ
              </span>
            </div>

            {/* ✅ NEW: dòng giảm giá HSSV */}
            {studentDiscountTotal > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Giảm giá HSSV:</span>
                <span>- {studentDiscountTotal.toLocaleString()}đ</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-semibold">
                {shippingFeeAfterStudent === 0
                  ? "Miễn phí"
                  : `${shippingFeeAfterStudent.toLocaleString()}đ`}
              </span>
            </div>

            {/* Voucher */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium animate-pulse">
                <span>Mã giảm giá ({appliedCode}):</span>
                <span>- {discountAmount.toLocaleString()}đ</span>
              </div>
            )}

            <div className="flex justify-between text-lg border-t pt-2">
              <span className="font-semibold">Tổng thanh toán:</span>
              <span className="font-bold text-red-600 text-xl">
                {finalTotal.toLocaleString()}đ
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => navigate(PATHS.CHECKOUT_INFO)}
              className="flex-1"
            >
              Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending}
              className="flex-1 h-12 text-lg shadow-lg shadow-blue-200 transition-transform active:scale-95"
            >
              {createOrderMutation.isPending
                ? "⏳ Đang xử lý..."
                : `ĐẶT HÀNG • ${finalTotal.toLocaleString()}đ`}
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              💡 <strong>Lưu ý:</strong> Sau khi đặt hàng thành công, bạn sẽ
              nhận được email xác nhận và có thể theo dõi đơn hàng trong mục{" "}
              <strong>Đơn hàng của tôi</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
