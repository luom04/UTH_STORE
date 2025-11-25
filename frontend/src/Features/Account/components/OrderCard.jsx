// src/Features/Account/components/OrderCard.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../routes/paths.jsx";
import ReviewModal from "../components/ReviewModal";
import { useCancelOrder } from "../../../hooks/useOrders.js";
import { TicketPercent } from "lucide-react";

const STATUS_TEXT = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang vận chuyển",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
  expired: "Hết hạn",
};

function getStatusClass(status) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "confirmed":
      return "bg-blue-50 text-blue-700";
    case "shipping":
      return "bg-sky-50 text-sky-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "canceled":
    case "expired":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
}

export default function OrderCard({ o }) {
  const items = Array.isArray(o.items) ? o.items : [];
  const totalQty = items.reduce((sum, it) => sum + (it.qty || 0), 0);

  // ✅ Tổng tiền hàng TRƯỚC HSSV (để hiển thị)
  const itemsTotalOriginal = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = it.qty || 0;

      // ưu tiên originalPrice (snapshot trước HSSV)
      const original =
        typeof it.originalPrice === "number" && it.originalPrice > 0
          ? it.originalPrice
          : typeof it.price === "number"
          ? it.price
          : 0;

      return sum + original * qty;
    }, 0);
  }, [items]);

  // ✅ Tổng giảm HSSV (ưu tiên field order, fallback tính từ items)
  const studentDiscountAmount =
    typeof o.studentDiscountAmount === "number"
      ? o.studentDiscountAmount
      : items.reduce(
          (sum, it) => sum + (it.studentDiscountPerUnit || 0) * (it.qty || 0),
          0
        );

  const createdAt = o.createdAt ? new Date(o.createdAt) : null;
  const statusLabel = STATUS_TEXT[o.status] || o.status || "Không xác định";
  const isCompleted = o.status === "completed";

  const cancelMut = useCancelOrder();

  const [reviewItem, setReviewItem] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleOpenReview = (it) => {
    if (!it.product) return;
    setReviewItem({
      orderId: o._id,
      productId: it.product,
      productTitle: it.title,
      productImage: it.image,
    });
  };

  const handleCloseReview = () => setReviewItem(null);

  const getProductDetailUrl = (item) => {
    const slug = item.slug;
    const productId = item.product;
    if (slug && PATHS.PRODUCT_DETAIL) {
      return PATHS.PRODUCT_DETAIL.replace(":slug", slug);
    }
    return `/products/${slug || productId}`;
  };

  const handleOpenCancelModal = () => {
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    cancelMut.mutate(
      { orderId: o._id || o.id, reason: cancelReason },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
          setCancelReason("");
        },
      }
    );
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-blue-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-3">
        <div className="text-sm text-gray-600">
          Mã đơn:{" "}
          <span className="font-semibold text-gray-800">
            {o.orderNumber || o._id}
          </span>
          {createdAt && (
            <>
              <span className="mx-2">•</span>
              Ngày đặt: {createdAt.toLocaleString()}
            </>
          )}
        </div>

        <div
          className={
            "rounded-full px-3 py-1 text-sm font-medium " +
            getStatusClass(o.status)
          }
        >
          {statusLabel}
        </div>
      </div>

      {/* Lý do hủy */}
      {o.status === "canceled" && o.cancelReason && (
        <div className="mt-2 mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span className="font-semibold">Lý do hủy:</span> {o.cancelReason}
        </div>
      )}

      {/* Items */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.map((it, idx) => {
          const detailUrl = getProductDetailUrl(it);

          const qty = it.qty || 0;
          const finalPrice = typeof it.price === "number" ? it.price : 0;

          const originalPrice =
            typeof it.originalPrice === "number" && it.originalPrice > 0
              ? it.originalPrice
              : finalPrice;

          const hasStudentDiscount = finalPrice < originalPrice;

          return (
            <div
              key={`${o._id || o.orderNumber}-${idx}`}
              className="flex min-w-[220px] items-center gap-3"
            >
              <Link to={detailUrl} className="flex-shrink-0">
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-16 w-16 rounded-md object-cover bg-gray-50 hover:opacity-90 transition-opacity cursor-pointer"
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/64x64?text=NoImg")
                  }
                />
              </Link>

              <div className="min-w-0">
                <Link
                  to={detailUrl}
                  className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-red-600 cursor-pointer"
                >
                  {it.title}
                </Link>

                {/* ✅ Giá hiển thị: ưu tiên ORIGINAL (trước HSSV) */}
                <div className="text-xs text-gray-500 mt-1">
                  SL: {qty} •{" "}
                  <span className="font-semibold text-gray-900">
                    {originalPrice.toLocaleString()}đ
                  </span>
                </div>

                {isCompleted && it.product && (
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleOpenReview(it)}
                  >
                    Viết / sửa đánh giá
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
        <div className="flex flex-col items-end text-sm space-y-1">
          {/* ✅ Tổng tiền hàng TRƯỚC HSSV */}
          <div className="flex justify-between w-full max-w-[300px] text-gray-500">
            <span>Tổng tiền hàng ({totalQty} sp):</span>
            <span>{itemsTotalOriginal.toLocaleString()}đ</span>
          </div>

          {/* ✅ Giảm giá HSSV */}
          {studentDiscountAmount > 0 && (
            <div className="flex justify-between w-full max-w-[300px] text-emerald-600 font-medium">
              <span>Giảm giá HSSV:</span>
              <span>- {studentDiscountAmount.toLocaleString()}đ</span>
            </div>
          )}

          {/* Voucher */}
          {o.discountAmount > 0 && (
            <div className="flex justify-between w-full max-w-[300px] text-green-600 font-medium">
              <span className="flex items-center gap-1">
                <TicketPercent size={14} /> Voucher {o.couponCode}:
              </span>
              <span>- {o.discountAmount.toLocaleString()}đ</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between w-full max-w-[300px] text-gray-500">
            <span>Phí vận chuyển:</span>
            <span>
              {o.shippingFee > 0
                ? `${o.shippingFee.toLocaleString()}đ`
                : "Miễn phí"}
            </span>
          </div>

          {/* Grand total */}
          <div className="flex justify-between w-full max-w-[300px] border-t mt-2 pt-2 items-center">
            <span className="font-semibold text-gray-800">Thành tiền:</span>
            <span className="font-bold text-xl text-red-600">
              {o.grandTotal?.toLocaleString()}đ
            </span>
          </div>
        </div>

        {o.status === "pending" && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleOpenCancelModal}
              disabled={cancelMut.isPending}
              className="rounded-full border px-4 py-1.5 text-xs font-medium border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              Hủy đơn hàng
            </button>
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewItem && (
        <ReviewModal
          open={!!reviewItem}
          onClose={handleCloseReview}
          orderId={reviewItem.orderId}
          productId={reviewItem.productId}
          productTitle={reviewItem.productTitle}
          productImage={reviewItem.productImage}
        />
      )}

      {/* Cancel modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900">
              Hủy đơn hàng
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Bạn có chắc muốn hủy đơn{" "}
              <span className="font-medium">{o.orderNumber || o._id}</span>? Bạn
              có thể ghi ngắn gọn lý do để store hỗ trợ tốt hơn.
            </p>

            <div className="mt-4">
              <label
                htmlFor="cancelReason"
                className="block text-sm font-medium text-gray-700"
              >
                Lý do hủy (không bắt buộc)
              </label>
              <textarea
                id="cancelReason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="VD: Đặt nhầm sản phẩm, đổi ý..."
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelMut.isPending}
                className="rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancelMut.isPending ? "Đang hủy..." : "Xác nhận hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
