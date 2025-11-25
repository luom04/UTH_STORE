import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Search,
  Loader2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "../../../components/Button/Button.jsx";
import {
  useAdminReviews,
  useAdminReplyReview,
  useAdminReviewStats,
  useToggleReviewVisibility,
} from "../../../hooks/useReviews.js";
import ReviewReplyModal from "../components/ReviewReplyModal.jsx";
import ReviewsAnalytics from "../components/ReviewsAnalytics.jsx";

// --- Helper Components ---
function RatingBadge({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-100">
      <Star size={12} className="fill-yellow-500 text-yellow-500" />
      {value.toFixed(1)}
    </span>
  );
}

function StatusPill({ hasReply }) {
  if (hasReply) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
        Đã trả lời
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
      Chưa trả lời
    </span>
  );
}

// --- Main Component ---
export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);

  // State tracking ID đang được toggle để hiện loading spinner riêng cho dòng đó
  const [togglingId, setTogglingId] = useState(null);

  // Time Range
  const [timeRange, setTimeRange] = useState("14d");
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 14;
  const daysLabel =
    days === 7
      ? "7 ngày gần đây"
      : days === 30
      ? "30 ngày gần đây"
      : `${days} ngày gần đây`;

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchText]);

  // 1. Load review
  const {
    data: reviewsRes,
    isLoading,
    isError,
    error,
  } = useAdminReviews({
    page,
    limit: 20,
    days,
    rating: ratingFilter,
    hasReply: replyFilter,
    q: debouncedSearch,
  });

  const reviews = reviewsRes?.data || [];
  const meta = reviewsRes?.meta;

  // 2. Load Stats
  const { data: reviewStats } = useAdminReviewStats({ days });

  const summary = reviewStats?.summary || {
    totalReviews: 0,
    avgRating: 0,
    replied: 0,
    unreplied: 0,
    replyRate: 0,
  };
  const productStats = reviewStats?.topProducts || [];
  const ratingChartData = useMemo(
    () =>
      (reviewStats?.charts?.byRating || []).map((b) => ({
        star: `${b.star}★`,
        count: b.count || 0,
      })),
    [reviewStats]
  );
  const timeChartData = useMemo(
    () => reviewStats?.charts?.byDate || [],
    [reviewStats]
  );

  // 3. Mutations
  const replyMut = useAdminReplyReview();
  const toggleVisibilityMut = useToggleReviewVisibility();

  // Handlers
  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedReview(null);
  };

  const handleSubmitReply = (content) => {
    if (!selectedReview) return;
    replyMut.mutate(
      { reviewId: selectedReview._id || selectedReview.id, content },
      { onSuccess: () => handleCloseReplyModal() }
    );
  };

  const handleToggleVisibility = (review) => {
    const reviewId = review._id || review.id;
    setTogglingId(reviewId); // Đánh dấu đang loading dòng này
    toggleVisibilityMut.mutate(reviewId, {
      onSettled: () => setTogglingId(null), // Tắt loading khi xong (dù lỗi hay thành công)
    });
  };

  const canPrev = meta?.page > 1;
  const canNext = meta?.page < meta?.totalPages;

  return (
    <div className="space-y-6">
      {/* Header + Summary */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Quản lý đánh giá sản phẩm
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi và phản hồi ý kiến khách hàng trong{" "}
              <span className="font-medium text-gray-700">{daysLabel}</span>.
            </p>
          </div>
          {/* Stats Mini */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 px-4 py-3 text-xs border border-gray-200">
            <div>
              <p className="text-[11px] text-gray-500 uppercase">
                Tổng đánh giá
              </p>
              <p className="text-lg font-bold text-gray-900">
                {summary.totalReviews}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase">Điểm TB</p>
              <p className="flex items-center gap-1 text-lg font-bold text-gray-900">
                {summary.totalReviews ? summary.avgRating.toFixed(1) : "0.0"}{" "}
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase">Đã trả lời</p>
              <p className="text-lg font-bold text-emerald-600">
                {summary.replied}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase">
                Chưa trả lời
              </p>
              <p className="text-lg font-bold text-slate-600">
                {summary.unreplied}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sao:</span>
              <select
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Trạng thái:</span>
              <select
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                value={replyFilter}
                onChange={(e) => {
                  setReplyFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="unreplied">Chưa trả lời</option>
                <option value="replied">Đã trả lời</option>
              </select>
            </div>
            <div className="flex items-center gap-2 border-l pl-3 ml-1">
              <div className="inline-flex rounded-lg bg-gray-100 p-1 text-xs">
                {["7d", "14d", "30d"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setTimeRange(range);
                      setPage(1);
                    }}
                    className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                      timeRange === range
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {range === "7d"
                      ? "7 ngày"
                      : range === "14d"
                      ? "14 ngày"
                      : "30 ngày"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              placeholder="Tìm theo nội dung..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <ReviewsAnalytics
        productStats={productStats}
        ratingChartData={ratingChartData}
        timeChartData={timeChartData}
        daysLabel={daysLabel}
      />

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Sản phẩm</th>
                <th className="px-6 py-3">Đánh giá</th>
                <th className="px-6 py-3">Nội dung</th>
                <th className="px-6 py-3 text-center">Trạng thái</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-rose-500"
                  >
                    Không tải được danh sách đánh giá.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && reviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Không có đánh giá nào phù hợp.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                reviews.map((r) => {
                  const hasReply = !!r.adminReply?.content;
                  const authorName = r.user?.name || r.author || "Ẩn danh";
                  const createdAtText = r.createdAt
                    ? new Date(r.createdAt).toLocaleString("vi-VN")
                    : "";
                  const productTitle = r.product?.title || "—";
                  const reviewId = r._id || r.id;
                  const isToggling = togglingId === reviewId;

                  // Style hàng bị ẩn
                  const rowClass = r.isVisible
                    ? "hover:bg-gray-50/60 transition-colors"
                    : "bg-gray-100/70 opacity-70 hover:opacity-100 transition-opacity border-l-4 border-l-slate-400";

                  return (
                    <tr key={reviewId} className={rowClass}>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {authorName}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {createdAtText}
                          </span>
                          {r.isVerifiedPurchase && (
                            <span className="mt-1 inline-flex w-fit items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-100">
                              Đã mua hàng
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-[200px]">
                        <p
                          className="line-clamp-2 text-xs text-gray-600 leading-relaxed"
                          title={productTitle}
                        >
                          {productTitle}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top w-32">
                        <RatingBadge value={r.rating || 0} />
                      </td>
                      <td className="px-6 py-4 align-top max-w-[300px]">
                        <div className="flex flex-col gap-1">
                          {r.title && (
                            <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                              {r.title}
                            </p>
                          )}
                          {r.content && (
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                              {r.content}
                            </p>
                          )}
                          {/* Images */}
                          {Array.isArray(r.images) && r.images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {r.images.slice(0, 3).map((url, idx) => (
                                <div
                                  key={idx}
                                  className="h-10 w-10 overflow-hidden rounded-lg border bg-gray-50"
                                >
                                  <img
                                    src={url}
                                    alt={`thumb-${idx}`}
                                    className="h-full w-full object-cover hover:scale-110 transition-transform"
                                  />
                                </div>
                              ))}
                              {r.images.length > 3 && (
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
                                  +{r.images.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          {/* Label Ẩn */}
                          {!r.isVisible && (
                            <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                              <EyeOff size={10} /> Đang bị ẩn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-center w-32">
                        <StatusPill hasReply={hasReply} />
                      </td>

                      {/* CỘT HÀNH ĐỘNG (SỬA LẠI) */}
                      <td className="px-6 py-4 align-top text-right w-44">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. Nút Ẩn/Hiện */}
                          <button
                            onClick={() => handleToggleVisibility(r)}
                            disabled={isToggling}
                            className={`p-2 rounded-lg border transition-all ${
                              r.isVisible
                                ? "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300"
                                : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                            }`}
                            title={
                              r.isVisible
                                ? "Đang hiện (Click để ẩn)"
                                : "Đang ẩn (Click để hiện)"
                            }
                          >
                            {isToggling ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : r.isVisible ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </button>

                          {/* 2. Nút Sửa/Trả lời (Đã thêm Padding) */}
                          <Button
                            type="button"
                            size="xs"
                            variant={hasReply ? "secondary" : "primary"}
                            startIcon={<MessageCircle size={14} />}
                            className="px-3 py-1.5 h-9" // ✅ Padding chuẩn
                            onClick={() => handleOpenReplyModal(r)}
                          >
                            {hasReply ? "Sửa" : "Trả lời"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {meta?.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50">
            <span className="text-xs text-gray-500">
              Trang {meta.page} / {meta.totalPages} • Tổng {meta.total} đánh giá
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="xs"
                disabled={!canPrev}
                onClick={() => canPrev && setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="secondary"
                size="xs"
                disabled={!canNext}
                onClick={() => canNext && setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <ReviewReplyModal
        open={replyModalOpen}
        onClose={handleCloseReplyModal}
        review={selectedReview}
        onSubmit={handleSubmitReply}
        submitting={replyMut.isPending}
      />
    </div>
  );
}
