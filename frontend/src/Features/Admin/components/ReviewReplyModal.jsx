// src/Features/Admin/components/ReviewReplyModal.jsx
import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import Button from "../../../components/Button/Button.jsx";

function StarRatingCompact({ rating = 0 }) {
  const totalStars = 5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: totalStars }).map((_, idx) => {
        const value = idx + 1;
        return (
          <Star
            key={idx}
            size={14}
            className={value <= rating ? "text-yellow-400" : "text-gray-300"}
            fill={value <= rating ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

/**
 * Modal hiển thị chi tiết 1 review + cho Admin trả lời/sửa trả lời
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - review: object (review được chọn)
 *  - onSubmit: (content: string) => void
 *  - submitting: boolean (trạng thái gửi API)
 */
export default function ReviewReplyModal({
  open,
  onClose,
  review,
  onSubmit,
  submitting = false,
}) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (review?.adminReply?.content) {
      setContent(review.adminReply.content);
    } else {
      setContent("");
    }
  }, [review]);

  if (!open || !review) return null;

  const authorName = review.user?.name || review.author || "Khách hàng ẩn danh";
  const rating = review.rating || 0;
  const dateText = review.createdAt
    ? new Date(review.createdAt).toLocaleString("vi-VN")
    : "";
  const images = Array.isArray(review.images) ? review.images : [];

  const isVerifiedPurchase = !!review.isVerifiedPurchase;
  const hasReply = !!review.adminReply?.content;

  const repliedAtText = review.adminReply?.repliedAt
    ? new Date(review.adminReply.repliedAt).toLocaleString("vi-VN")
    : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {hasReply ? "Sửa phản hồi" : "Trả lời đánh giá"}
            </h2>
            <p className="text-xs text-gray-500">
              Khách hàng: <span className="font-medium">{authorName}</span>
              {dateText && <> • {dateText}</>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-4 text-sm">
          {/* Thông tin review gốc */}
          <div className="rounded-lg border bg-gray-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StarRatingCompact rating={rating} />
                <span className="text-xs text-gray-500">
                  {rating.toFixed(1)} / 5.0
                </span>
              </div>
              {isVerifiedPurchase && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  Đã mua hàng
                </span>
              )}
            </div>

            {review.title && (
              <p className="mt-1 text-[13px] font-semibold text-gray-900">
                {review.title}
              </p>
            )}

            {review.content && (
              <p className="mt-1 text-[13px] text-gray-700 whitespace-pre-line">
                {review.content}
              </p>
            )}

            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="h-16 w-16 overflow-hidden rounded-md border bg-white"
                  >
                    <img
                      src={url}
                      alt={`review-img-${idx}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nếu đã từng trả lời thì show lại ở trên */}
          {hasReply && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">
                  Phản hồi hiện tại
                </span>
                {repliedAtText && (
                  <span className="text-[11px] text-slate-400">
                    {repliedAtText}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-line">{review.adminReply.content}</p>
            </div>
          )}

          {/* Form trả lời */}
          <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700">
              Nội dung phản hồi tới khách hàng
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="VD: Cảm ơn bạn đã tin tưởng sản phẩm của UTH Store. Nếu cần hỗ trợ bảo hành hoặc nâng cấp, bạn liên hệ hotline giúp mình nhé..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={submitting}
              >
                Đóng
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !content.trim()}
              >
                {submitting
                  ? hasReply
                    ? "Đang cập nhật..."
                    : "Đang gửi..."
                  : hasReply
                  ? "Cập nhật phản hồi"
                  : "Gửi phản hồi"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
