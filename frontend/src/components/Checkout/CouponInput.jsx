// src/components/Checkout/CouponInput.jsx
import { useState } from "react";
import {
  Tag,
  Loader2,
  X,
  CheckCircle,
  Ticket,
  ChevronRight,
} from "lucide-react";
import { useMyCoupons, useCheckCoupon } from "../../hooks/useCoupons"; // ✅ dùng hook theo flow api -> hook -> component

export default function CouponInput({ orderTotal, onApply }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);

  // ✅ lấy mutate từ hook (toast đã nằm trong hook)
  const { mutate: checkCoupon, isPending } = useCheckCoupon();

  // ✅ Lấy danh sách coupon của user
  const { data: myCoupons = [], isLoading: isLoadingCoupons } = useMyCoupons();

  const handleApply = (codeToApply) => {
    const finalCode = codeToApply || code; // Dùng code truyền vào hoặc state
    if (!finalCode?.trim()) return;

    // Set lại state code để hiển thị trên ô input
    setCode(finalCode);

    checkCoupon(
      { code: finalCode, orderTotal },
      {
        onSuccess: (data) => {
          // ✅ data giờ đã là payload chuẩn { code, discountAmount, ... }
          setApplied(data);
          onApply?.(data);
          // ❌ Không toast ở component (toast đã có trong hook)
        },
      }
    );
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    onApply?.(null);
    // ❌ Không toast ở component
  };

  // 1. Giao diện khi ĐÃ áp dụng mã thành công
  if (applied) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle size={18} />
          <div>
            <span className="font-bold mr-2">{applied.code}</span>
            <span className="text-sm bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-sm">
              - {applied.discountAmount.toLocaleString()}đ
            </span>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
          title="Gỡ mã"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  // 2. Giao diện nhập mã và gợi ý
  return (
    <div className="space-y-3">
      {/* Ô nhập liệu */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none uppercase font-medium transition-colors"
            placeholder="Nhập mã giảm giá"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={isPending}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        <button
          onClick={() => handleApply()}
          disabled={!code || isPending}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Áp dụng"
          )}
        </button>
      </div>

      {/* ✅ DANH SÁCH GỢI Ý COUPON */}
      {!isLoadingCoupons && myCoupons.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
            <Ticket size={12} /> Mã ưu đãi của bạn
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {myCoupons.map((coupon) => {
              // Kiểm tra xem đơn hàng hiện tại có đủ điều kiện về giá không
              const isEligible = orderTotal >= (coupon.minOrderValue || 0);

              return (
                <div
                  key={coupon._id}
                  onClick={() => isEligible && handleApply(coupon.code)}
                  className={`flex items-center justify-between p-2 rounded border bg-white transition-all relative overflow-hidden ${
                    isEligible
                      ? "border-blue-200 hover:border-blue-400 cursor-pointer hover:shadow-sm group"
                      : "border-gray-200 opacity-60 cursor-not-allowed grayscale"
                  }`}
                >
                  {/* Trang trí */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isEligible ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  ></div>

                  <div className="flex-1 ml-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800">
                        {coupon.code}
                      </span>
                      {/* Hiển thị giá trị giảm */}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium border border-orange-200">
                        {coupon.discountType === "percent"
                          ? `-${coupon.value}%`
                          : `-${coupon.value.toLocaleString()}đ`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {coupon.description}
                    </div>

                    {/* Thông báo nếu chưa đủ điều kiện */}
                    {!isEligible && (
                      <div className="text-[10px] text-red-500 mt-1 font-medium">
                        Mua thêm{" "}
                        {(coupon.minOrderValue - orderTotal).toLocaleString()}đ
                        để dùng
                      </div>
                    )}
                  </div>

                  {isEligible && (
                    <button className="text-blue-600 bg-blue-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
