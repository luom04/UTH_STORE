// src/pages/Cart/CheckoutPayment.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useCreateOrder } from "../../hooks/useOrders";
import {
  useCreateVNPayPayment,
  useCreateMoMoPayment,
} from "../../hooks/usePayment";
import { useAuth } from "../../contexts/AuthContext";
import { PATHS } from "../../routes/paths";
import CheckoutStepper from "../../components/Checkout/CheckoutStepper";
import Button from "../../components/Button/Button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import CouponInput from "../../components/Checkout/CouponInput";

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Lấy thêm refetch để làm mới giỏ hàng khi cần
  const { cart, isLoading: cartLoading, refetch: refetchCart } = useCart();

  const createOrder = useCreateOrder();
  const createVNPayPayment = useCreateVNPayPayment();
  const createMoMoPayment = useCreateMoMoPayment();

  const [paymentMethod, setPaymentMethod] = useState("COD");
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
        line2: parsed.address.line2 || "",
      };
    } catch (error) {
      console.error("Error parsing checkout info:", error);
      return null;
    }
  };

  const [shippingAddress, setShippingAddress] = useState(getShippingAddress());

  // Check địa chỉ
  useEffect(() => {
    const address = getShippingAddress();
    setShippingAddress(address);
    if (!address) {
      toast.error("Vui lòng điền thông tin giao hàng");
      navigate(PATHS.CHECKOUT_INFO);
    }
  }, [navigate]);

  // ================= TÍNH TOÁN TIỀN =================
  const isStudent = !!user?.isStudent;

  const studentDiscountTotal =
    isStudent && cart?.items
      ? cart.items.reduce((sum, item) => {
          const qty = Number(item.qty) || 0;
          const perUnitDiscount = Number(
            item.studentDiscountAmount ||
              item.product?.studentDiscountAmount ||
              0
          );

          // Giá cơ sở để tính cap
          const basePrice =
            Number(
              item.priceSale ||
                item.price ||
                item.product?.priceSale ||
                item.product?.price
            ) || (qty > 0 ? Number(item.subtotal || 0) / qty : 0);

          const appliedPerUnit = Math.min(perUnitDiscount, basePrice);
          return sum + appliedPerUnit * qty;
        }, 0)
      : 0;

  const itemsTotalAfterStudent = Math.max(
    0,
    Number(cart?.itemsTotal || 0) - studentDiscountTotal
  );
  const shippingFeeAfterStudent = itemsTotalAfterStudent >= 500000 ? 0 : 50000; // Logic cũ của bạn là 50k
  const finalTotal = Math.max(
    0,
    itemsTotalAfterStudent + shippingFeeAfterStudent - discountAmount
  );

  // ================= XỬ LÝ ĐẶT HÀNG =================
  const handlePlaceOrder = async () => {
    // 1. Kiểm tra giỏ hàng lần cuối
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Giỏ hàng đang trống! Vui lòng kiểm tra lại.");
      await refetchCart(); // Làm mới để UI cập nhật
      return;
    }

    const currentAddress = getShippingAddress();
    if (!currentAddress) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      navigate(PATHS.CHECKOUT_INFO);
      return;
    }

    // 2. Chuẩn bị data chung (Map field cho khớp với Controller Payment)
    const paymentPayload = {
      shippingInfo: {
        fullName: currentAddress.fullname,
        phone: currentAddress.phone,
        address: currentAddress.address,
        line2: currentAddress.line2 || "",
        ward: currentAddress.ward, // Backend nhận object hoặc string (đã handle ở controller)
        district: currentAddress.district,
        city: currentAddress.province, // 🔥 Backend PaymentController dùng 'city', Frontend lưu 'province'
      },
      note: "",
      couponCode: appliedCode ? appliedCode.toUpperCase() : "",
    };

    try {
      // ----------- CASE 1: COD -----------
      if (paymentMethod === "COD") {
        createOrder.mutate(
          {
            shippingAddress: currentAddress,
            paymentMethod: "COD",
            itemsTotal: cart.itemsTotal,
            couponCode: paymentPayload.couponCode,
            note: paymentPayload.note,
          },
          {
            onSuccess: (order) => {
              // COD thành công -> có object order -> chuyển qua Success
              navigate(PATHS.CHECKOUT_SUCCESS, { state: { order } });
            },
            onError: (err) => {
              // Handle lỗi giỏ hàng rỗng ở đây
              if (err.message?.includes("trống")) {
                toast.error("Giỏ hàng đã hết hạn hoặc đã được đặt trước đó.");
                refetchCart();
                navigate(PATHS.HOME);
              } else {
                toast.error(err.message || "Đặt hàng thất bại");
              }
            },
          }
        );
      }

      // ----------- CASE 2: VNPay -----------
      else if (paymentMethod === "VNPay") {
        const result = await createVNPayPayment.mutateAsync(paymentPayload);

        if (result && result.success && result.paymentUrl) {
          // sessionStorage.setItem("pendingOrderId", result.order._id);
          window.location.href = result.paymentUrl;
        } else {
          toast.error("Không tạo được cổng thanh toán VNPay");
        }
      }

      // ----------- CASE 3: MoMo -----------
      else if (paymentMethod === "MOMO") {
        const result = await createMoMoPayment.mutateAsync(paymentPayload);

        // Backend trả về: { success: true, payUrl: "...", order: {...} }
        if (result && result.success && result.payUrl) {
          // sessionStorage.setItem("pendingOrderId", result.order._id);
          window.location.href = result.payUrl;
        } else {
          toast.error("Không tạo được cổng thanh toán MoMo");
        }
      }
    } catch (error) {
      console.error("❌ Payment Error:", error);

      // Nếu lỗi là do giỏ hàng trống (Backend trả 400)
      const msg =
        error?.response?.data?.message || error.message || "Lỗi thanh toán";

      if (msg.toLowerCase().includes("trống") || msg.includes("Cart")) {
        toast.error("Giỏ hàng không tồn tại hoặc đã được thanh toán.");
        await refetchCart();
        setTimeout(() => navigate(PATHS.HOME), 1500);
      } else {
        toast.error(msg);
      }
    }
  };

  // --- RENDER ---
  if (!shippingAddress || cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10 text-center text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        Đang tải thông tin...
      </div>
    );
  }

  // Nếu load xong mà giỏ hàng rỗng -> Hiển thị Empty State
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">
            Giỏ hàng của bạn đang trống
          </p>
          <p className="text-gray-500 mb-4">
            Có thể bạn đã hoàn tất đơn hàng này rồi.
          </p>
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

  const isProcessing =
    createOrder.isPending ||
    createVNPayPayment.isPending ||
    createMoMoPayment.isPending;

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
                disabled={isProcessing}
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
              Sản phẩm ({cart.items.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div
                  key={item.id || item.product._id}
                  className="flex gap-3 items-center"
                >
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
                      {item.subtotal?.toLocaleString()}đ
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
              orderTotal={itemsTotalAfterStudent}
              onApply={(res) => {
                if (res) {
                  setDiscountAmount(res.discountAmount);
                  setAppliedCode(res.code);
                } else {
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

            {/* COD */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all mb-3 ${
                paymentMethod === "COD"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1"
                disabled={isProcessing}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  Thanh toán khi nhận hàng (COD)
                </div>
                <div className="text-sm text-gray-600">
                  Thanh toán bằng tiền mặt khi nhận hàng
                </div>
              </div>
            </label>

            {/* VNPay */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all mb-3 ${
                paymentMethod === "VNPay"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="VNPay"
                checked={paymentMethod === "VNPay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1"
                disabled={isProcessing}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-900">
                    Thanh toán qua VNPay
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    QR Code
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Thanh toán bằng QR Code hoặc thẻ ATM/Visa/MasterCard
                </div>
              </div>
            </label>

            {/* MoMo - Đã vô hiệu hóa */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-xl transition-all mb-3 
    opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 border-gray-200
  `}
            >
              <input
                type="radio"
                name="payment"
                value="MOMO"
                checked={paymentMethod === "MOMO"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1"
                disabled={true} // 👈 Khóa input
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-500">
                    {" "}
                    {/* Đổi màu chữ thành xám */}
                    Thanh toán qua MoMo
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded font-medium">
                    Bảo trì
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Đang bảo trì hệ thống, vui lòng chọn phương thức khác.
                </div>
              </div>
            </label>
          </div>

          {/* Tổng tiền */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">
                {cart.itemsTotal?.toLocaleString()}đ
              </span>
            </div>

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
              disabled={isProcessing}
            >
              Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={
                isProcessing ||
                !shippingAddress?.fullname?.trim() ||
                !shippingAddress?.phone?.trim() ||
                !shippingAddress?.address?.trim()
              }
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                isProcessing
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : paymentMethod === "MOMO"
                  ? "bg-pink-600 hover:bg-pink-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : paymentMethod === "VNPay" ? (
                "Thanh toán qua VNPay"
              ) : paymentMethod === "MOMO" ? (
                "Thanh toán qua MoMo"
              ) : (
                "Đặt hàng"
              )}
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
