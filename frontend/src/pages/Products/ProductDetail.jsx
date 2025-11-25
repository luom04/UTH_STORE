import { useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MessageCircle,
  Gift, // ✅ [ADDED] Import icon Gift
} from "lucide-react";
import Button from "../../components/Button/Button.jsx";
import { useCart } from "../../hooks/useCart"; // Hook giỏ hàng
import ProductGallery from "../../components/Product/ProductGallery.jsx";
import SpecsTable from "../../components/Product/SpecsTable.jsx";
import { useProduct, useBestSellers } from "../../hooks/useProductsPublic.js";
import { PATHS } from "../../routes/paths.jsx";
import ProductRow from "../../components/Product/ProductRow.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import toast from "react-hot-toast";
import { useProductReviews } from "../../hooks/useReviews.js";

const ZALO_CONTACT_URL = (import.meta.env.VITE_ZALO_CONTACT_URL || "").trim();

/* ======================= COMMON: STAR RATING ======================= */

function StarRating({ rating = 0, totalStars = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={16}
            className={
              starValue <= rating ? "text-yellow-400" : "text-gray-300"
            }
            fill={starValue <= rating ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

/* ======================= REVIEW ITEM ======================= */

function ReviewItem({ review, isOwn }) {
  // ID, tên, avatar, ... từ review
  const authorNameFromReview =
    review.user?.name || review.author || "Khách hàng ẩn danh";

  // Tên hiển thị chính
  const displayName = isOwn ? "Đánh giá của bạn" : authorNameFromReview;

  const avatar =
    review.user?.avatar ||
    review.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      authorNameFromReview
    )}&background=random`;

  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("vi-VN")
    : "";

  const rating = review.rating || 0;
  const title = review.title;
  const content = review.content;
  const images = Array.isArray(review.images) ? review.images : [];
  const isVerifiedPurchase = !!review.isVerifiedPurchase;

  // 👇 Thông tin phản hồi từ admin / staff
  const reply = review.adminReply || {};
  const replyContent = (reply.content || "").trim();
  const repliedAtText = reply.repliedAt
    ? new Date(reply.repliedAt).toLocaleString("vi-VN")
    : "";
  const replyByName =
    reply.repliedBy?.name || reply.repliedByName || "Admin cửa hàng";

  return (
    <div className="flex items-start gap-4 py-4">
      <img
        src={avatar}
        alt={authorNameFromReview}
        className="size-10 rounded-full"
      />

      <div className="flex-1">
        {/* Header: tên + ngày + rating + badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{displayName}</p>
            {date && (
              <p className="text-xs text-gray-500">
                {isOwn ? `Bạn đánh giá ngày ${date}` : date}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={rating} />
            {isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 size={12} />
                Đã mua hàng
              </span>
            )}
          </div>
        </div>

        {/* Tiêu đề */}
        {title && (
          <p className="mt-2 text-sm font-semibold text-gray-900">{title}</p>
        )}

        {/* Nội dung */}
        {content && (
          <p className="mt-1 text-sm text-gray-700 leading-relaxed">
            {content}
          </p>
        )}

        {/* Ảnh đính kèm */}
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="h-16 w-16 overflow-hidden rounded-lg border bg-gray-50"
              >
                <img
                  src={url}
                  alt={`review-${idx}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 👇 Phản hồi từ admin / CSKH */}
        {replyContent && (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <div className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
              <MessageCircle size={14} className="text-red-500" />
              <span>Phản hồi từ {replyByName}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{replyContent}</p>
            {repliedAtText && (
              <p className="mt-1 text-xs text-gray-400">
                Trả lời ngày {repliedAtText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================= PRODUCT REVIEWS LIST ======================= */

function ProductReviews({ reviews = [], loading, currentUserId }) {
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        totalReviews
      : 0;

  const averageRatingDisplay = averageRating.toFixed(1);

  return (
    <section id="reviews" className="rounded-xl bg-white shadow-sm p-5">
      <h2 className="text-xl font-bold mb-4">Đánh giá từ khách hàng</h2>

      {/* Loading */}
      {loading && !totalReviews && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tải đánh giá...</span>
        </div>
      )}

      {/* Không có review */}
      {!loading && totalReviews === 0 && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Chưa có đánh giá cho sản phẩm này. Hãy là người đầu tiên chia sẻ trải
          nghiệm của bạn!
        </div>
      )}

      {/* Có review */}
      {totalReviews > 0 && (
        <>
          {/* Summary */}
          <div className="mb-4 flex items-center gap-4 rounded-lg bg-gray-50 p-4">
            <div className="text-4xl font-bold text-gray-800">
              {averageRatingDisplay}
            </div>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-sm text-gray-600">
                Dựa trên {totalReviews} đánh giá
              </p>
            </div>
          </div>

          {/* List */}
          <div className="divide-y">
            {reviews.map((review) => {
              // Chuẩn hoá userId trong review: có thể là object {_id}, {id} hoặc string
              const reviewUserId =
                review.user?._id || review.user?.id || review.user || null;

              const isOwn =
                !!currentUserId &&
                !!reviewUserId &&
                String(reviewUserId) === String(currentUserId);

              return (
                <ReviewItem
                  key={review._id || review.id}
                  review={review}
                  isOwn={isOwn}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

/* ======================= BEST SELLERS ROW ======================= */

function RowBestSellers({ title, href, category, limit = 10 }) {
  const { data, isLoading, isError } = useBestSellers({ category, limit });
  return (
    <ProductRow
      title={title}
      viewAllHref={href}
      products={data?.list}
      loading={isLoading}
      error={isError}
    />
  );
}

/* ======================= MAIN: PRODUCT DETAIL PAGE ======================= */

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart, isAdding } = useCart();
  const { user, isAuthenticated } = useAuth();
  const reviewsRef = useRef(null);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { data: product, isLoading, isError, error } = useProduct(slug);

  const productId = product?._id || product?.id;

  // ✅ Chuẩn hoá currentUserId theo nhiều khả năng BE trả
  const currentUserId = user?._id || user?.id || user?.userId || null;

  // ✅ LẤY REVIEW THẬT TỪ API
  const {
    data: reviewsResult,
    isLoading: isLoadingReviews,
    isError: isErrorReviews, // nếu cần debug
  } = useProductReviews({
    productId,
    page: 1,
    limit: 10,
  });

  const rawReviews = reviewsResult?.data || [];

  const reviews = useMemo(() => {
    return rawReviews.filter((r) => {
      const isOwn =
        currentUserId &&
        (r.user?._id === currentUserId || r.user === currentUserId);
      return r.isVisible || isOwn;
    });
  }, [rawReviews, currentUserId]);
  const totalReviews = reviews.length;

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const averageRatingDisplay = averageRating.toFixed(1);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const result = [];
    const seen = new Set();

    const push = (src) => {
      if (!src) return;
      if (seen.has(src)) return;
      seen.add(src);
      result.push(src);
    };

    if (Array.isArray(product.images) && product.images.length) {
      push(product.images[0]);
      product.images.slice(1).forEach(push);
    }

    if (Array.isArray(product.thumbnails) && product.thumbnails.length) {
      product.thumbnails.forEach(push);
    }

    if (!result.length && Array.isArray(product.thumbnails)) {
      product.thumbnails.forEach(push);
    }

    return result;
  }, [product]);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasDiscount = product?.discountPercent > 0;

  const originalPrice = Number(product?.price || 0);
  const finalPrice =
    hasDiscount && product.priceSale != null
      ? Number(product.priceSale)
      : originalPrice;

  const redirectToLogin = () => {
    navigate(PATHS.LOGIN, {
      state: {
        from: location.pathname + location.search,
        reason: "need_auth_to_buy",
      },
    });
  };

  const handleContactZalo = () => {
    if (!product) return;

    if (!ZALO_CONTACT_URL) {
      toast.info("Vui lòng cấu hình VITE_ZALO_CONTACT_URL trong file .env");
      return;
    }

    window.open(ZALO_CONTACT_URL, "_blank", "noopener,noreferrer");
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (!product || product.stock === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    addToCart(
      {
        productId: product._id || product.id,
        qty: 1,
      },
      {
        onSuccess: () => {
          navigate(PATHS.CART);
        },
      }
    );
  };

  /* ======================= LOADING / ERROR ======================= */

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-3 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-3 text-gray-600">Đang tải sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("❌ API Error:", error);
    return (
      <div className="max-w-6xl mx-auto px-3 py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-red-600 text-lg mb-2">
            {error?.message || "Không tìm thấy sản phẩm"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Debug: {JSON.stringify(error)}
          </p>
          <Button variant="primary" onClick={() => navigate(`${PATHS.HOME}`)}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    console.warn("⚠️ No product data returned");
    return (
      <div className="max-w-6xl mx-auto px-3 py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-gray-600 text-lg mb-4">Không tìm thấy sản phẩm</p>
          <Button variant="primary" onClick={() => navigate(`${PATHS.HOME}`)}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  /* ======================= NORMAL RENDER ======================= */

  const description = product.description;
  const isDescriptionLong = description && description.split("\n").length > 5;
  const descriptionClasses = `prose max-w-none mb-6 transition-max-h duration-500 ${
    isDescriptionExpanded ? "max-h-full" : "line-clamp-5"
  }`;

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      {/* TOP: 2 CỘT - GALLERY + INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductGallery images={galleryImages} title={product.title} />

        <div className="rounded-xl bg-white shadow-sm p-5">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {product.title}
          </h1>

          {/* Rating + link scroll xuống reviews */}
          <div className="mt-3 flex items-center gap-3">
            {totalReviews > 0 ? (
              <>
                <StarRating rating={Math.round(averageRating)} />
                <button
                  onClick={scrollToReviews}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {averageRatingDisplay} ({totalReviews} đánh giá)
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                Chưa có đánh giá nào
              </span>
            )}
          </div>

          {/* Giá */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {hasDiscount && (
              <>
                <div className="text-lg text-gray-400 line-through">
                  {originalPrice.toLocaleString()}đ
                </div>

                <span className="inline-flex items-center rounded-full border border-red-500 px-2 py-0.5 text-xs font-semibold text-red-600 bg-red-50">
                  -{product.discountPercent}%
                </span>
              </>
            )}

            <div className="text-3xl font-bold text-red-600">
              {finalPrice.toLocaleString()}đ
            </div>
          </div>

          {/* ✅ [NEW] KHU VỰC QUÀ TẶNG & KHUYẾN MÃI */}
          {((product.gifts && product.gifts.length > 0) ||
            product.promotionText) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg animate-fade-in">
              <h3 className="font-bold text-red-700 flex items-center gap-2 text-sm uppercase mb-2">
                <Gift size={18} /> Quà tặng & Ưu đãi
              </h3>

              {/* Promotion Text */}
              {product.promotionText && (
                <div className="mb-2 text-sm font-medium text-red-600 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  {product.promotionText}
                </div>
              )}

              {/* List Quà */}
              {product.gifts?.length > 0 && (
                <ul className="space-y-1.5">
                  {product.gifts.map((gift, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                      <span className="font-medium">{gift}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tồn kho */}
          <div className="mt-3">
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">
                ✓ Còn hàng ({product.stock} sản phẩm)
              </span>
            ) : (
              <span className="text-sm text-red-600">✗ Hết hàng</span>
            )}
          </div>

          {/* Nút hành động */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="zalo"
              size="md"
              onClick={handleContactZalo}
              className="bg-[#0A7CFF] hover:bg-[#0564cc] text-white"
            >
              <span className="flex items-center justify-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1200px-Icon_of_Zalo.svg.png"
                  alt="Zalo"
                  className="w-5 h-5"
                />
                <span>Liên hệ tư vấn qua Zalo</span>
              </span>
            </Button>

            <Button
              variant="primary"
              size="md"
              startIcon={<ShoppingCart size={16} />}
              disabled={product.stock === 0 || isAdding}
              onClick={handleAddToCart}
              className="cursor-pointer"
            >
              {isAdding ? "⏳ Đang thêm..." : "THÊM VÀO GIỎ"}
            </Button>
          </div>

          {/* Highlight text */}
          {product.highlightText && (
            <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 leading-relaxed">
                ✨ {product.highlightText}
              </p>
            </div>
          )}

          {/* Chính sách */}
          <div className="mt-5 border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Chính sách</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={PATHS.WARRANTY_POLICY}
                  className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  📦 Chính sách đổi trả 7 ngày
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.WARRANTY_POLICY}
                  className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  🛡️ Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.INSTALLMENT_INSTRUCTIONS}
                  className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  💳 Hướng dẫn thanh toán & trả góp
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* MÔ TẢ + CẤU HÌNH */}
      <div className="mt-6 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Thông tin sản phẩm</h2>

        <div className="relative">
          {description ? (
            <>
              <div className={descriptionClasses}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {isDescriptionLong && (
                <div
                  className={`relative ${
                    isDescriptionExpanded
                      ? ""
                      : 'before:content-[""] before:absolute before:inset-0 before:bg-gradient-to-t before:from-white before:to-transparent'
                  }`}
                >
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 transform text-sm font-medium text-blue-600 hover:text-blue-700 bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center gap-1 shadow-md cursor-pointer"
                    style={{
                      marginTop: isDescriptionExpanded ? "10px" : "-20px",
                    }}
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Thu gọn <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Xem thêm <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 italic p-4 border border-dashed rounded-lg bg-gray-50">
              ... Nội dung mô tả đang được cập nhật.
            </div>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <h3 className="text-xl font-semibold mb-4">Cấu hình chi tiết</h3>
          <SpecsTable specs={product.specs || {}} />
        </div>
      </div>

      {/* REVIEWS */}
      <div ref={reviewsRef} className="mt-6">
        <ProductReviews
          reviews={reviews}
          loading={isLoadingReviews}
          currentUserId={currentUserId}
        />
      </div>

      {/* SẢN PHẨM LIÊN QUAN */}
      <RowBestSellers
        title="Sản phẩm liên quan"
        href={`/collections/${product.category}`}
        category={product.category}
      />
    </div>
  );
}
