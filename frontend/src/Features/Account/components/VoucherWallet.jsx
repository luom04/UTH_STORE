// src/Features/User/components/VoucherWallet.jsx
import { useMyCoupons } from "../../../hooks/useCoupons";
import {
  TicketPercent,
  Copy,
  Loader2,
  Clock,
  Zap, // Dùng icon tia sét cho "Có giới hạn"
} from "lucide-react";
import toast from "react-hot-toast";

export default function VoucherWallet() {
  const { data: coupons, isLoading } = useMyCoupons();

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  // Helper: Chọn màu sắc dựa trên Rank
  const getCouponStyle = (rank) => {
    switch (rank) {
      case "DIAMOND":
        return "border-purple-200 bg-purple-50 text-purple-700 ring-purple-100";
      case "GOLD":
        return "border-yellow-200 bg-yellow-50 text-yellow-700 ring-yellow-100";
      case "SILVER":
        return "border-gray-300 bg-gray-50 text-gray-600 ring-gray-200";
      default: // MEMBER
        return "border-blue-200 bg-blue-50 text-blue-700 ring-blue-100";
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
        <TicketPercent className="text-blue-600" /> Kho Voucher của bạn
      </h2>

      {coupons?.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <TicketPercent className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm font-medium">
            Hiện chưa có mã giảm giá nào khả dụng.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hãy mua sắm thêm để nâng hạng nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const styleClass = getCouponStyle(c.requiredRank);

            return (
              <div
                key={c._id}
                className={`relative border rounded-xl p-0 flex items-stretch shadow-sm hover:shadow-md transition-all overflow-hidden group ${styleClass}`}
              >
                {/* Cột Trái: Giá trị giảm */}
                <div className="w-24 flex flex-col items-center justify-center border-r border-dashed border-gray-300 bg-white/50 p-2 text-center relative flex-shrink-0">
                  {/* Decorate: Lỗ đục bán nguyệt */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-b border-gray-200"></div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-t border-gray-200"></div>

                  <span className="text-2xl font-black tracking-tighter">
                    {c.discountType === "percent" ? `${c.value}%` : "GIẢM"}
                  </span>
                  <span className="text-[10px] font-bold uppercase opacity-80">
                    {c.discountType === "amount" ? `${c.value / 1000}k` : "OFF"}
                  </span>
                </div>

                {/* Cột Phải: Thông tin chi tiết */}
                <div className="flex-1 p-3 flex flex-col justify-between bg-white/30 min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col items-start">
                        <div className="font-bold text-lg tracking-wide font-mono leading-tight break-all">
                          {c.code}
                        </div>
                        {c.requiredRank !== "MEMBER" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded border bg-white/80 font-bold mt-1 shadow-sm">
                            {c.requiredRank}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => copyCode(c.code)}
                        className="p-1.5 rounded-lg hover:bg-black/5 text-inherit opacity-70 hover:opacity-100 transition-colors flex-shrink-0"
                        title="Sao chép"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <div className="text-xs font-medium opacity-80 line-clamp-1 mt-1">
                      {c.description}
                    </div>
                  </div>

                  {/* Điều kiện & Giới hạn */}
                  <div className="mt-2 space-y-0.5 border-t border-gray-200/30 pt-1">
                    <div className="text-[10px] opacity-70 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-current inline-block"></span>
                      {c.minOrderValue > 0
                        ? `Đơn từ ${c.minOrderValue.toLocaleString()}đ`
                        : "Mọi đơn hàng"}
                    </div>

                    {/* ✅ SỬA: Bỏ số lượng cụ thể. Chỉ hiện tag "Có giới hạn" để thúc đẩy mua hàng */}
                    {c.usageLimit > 0 && (
                      <div className="text-[10px] font-semibold text-orange-600 flex items-center gap-1">
                        <Zap size={10} fill="currentColor" />
                        <span>Số lượng có hạn</span>
                      </div>
                    )}

                    {/* Hạn sử dụng */}
                    {c.endDate && (
                      <div className="text-[10px] text-red-500/80 flex items-center gap-1 font-medium">
                        <Clock size={10} />
                        HSD: {new Date(c.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
