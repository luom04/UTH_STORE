// src/Features/Account/components/ReviewModal.jsx
import { useEffect, useState } from "react";
import { X, Star, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useMyReview, useUpsertReview } from "../../../hooks/useReviews.js";
import { useUploadToCloudinary } from "../../../hooks/useUploads.js";

export default function ReviewModal({
  open,
  onClose,
  orderId,
  productId,
  productTitle,
  productImage,
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Danh sách URL ảnh sẽ gửi lên BE
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const { data: review, isLoading: isLoadingReview } = useMyReview({
    orderId,
    productId,
    enabled: open,
  });

  const { mutate: upsertReview, isLoading: isSaving } = useUpsertReview();
  const uploadMut = useUploadToCloudinary();

  // Khi mở modal hoặc review load xong thì fill dữ liệu
  useEffect(() => {
    if (!open) return;

    if (review) {
      setRating(review.rating || 5);
      setTitle(review.title || "");
      setContent(review.content || "");
      setImageUrls(Array.isArray(review.images) ? review.images : []);
    } else {
      setRating(5);
      setTitle("");
      setContent("");
      setImageUrls([]);
    }
  }, [review, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (isUploadingImages) {
      toast.error("Đang upload ảnh, vui lòng chờ xíu rồi gửi lại");
      return;
    }

    upsertReview(
      {
        orderId,
        productId,
        rating,
        title,
        content,
        images: imageUrls, // gửi URL ảnh lên BE
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  // Chọn ảnh từ máy -> upload Cloudinary -> lưu URL
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setIsUploadingImages(true);
      const uploadedUrls = [];

      for (const file of files) {
        // folder: "reviews" bạn có thể đổi thành "products" hoặc để default
        const { url } = await uploadMut.mutateAsync({
          file,
          folder: "reviews",
          resourceType: "image",
        });
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
        toast.success("Upload ảnh thành công");
      }
    } catch (err) {
      console.error(err);
      // useUploadToCloudinary đã toast lỗi sẵn trong onError rồi
    } finally {
      setIsUploadingImages(false);
      // reset để nếu chọn lại cùng file vẫn trigger onChange
      e.target.value = "";
    }
  };

  const handleRemoveImage = (idx) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving && !isUploadingImages) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-3"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold text-gray-800">
            {review ? "Sửa đánh giá" : "Viết đánh giá"}
          </h2>
          <button
            type="button"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            disabled={isSaving || isUploadingImages}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          {/* Thông tin sản phẩm + rating */}
          <div className="flex gap-3">
            {productImage && (
              <img
                src={productImage}
                alt={productTitle}
                className="h-14 w-14 rounded-lg object-cover bg-gray-50"
              />
            )}
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-medium text-gray-900">
                {productTitle}
              </div>

              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="p-0.5"
                    onClick={() => setRating(v)}
                  >
                    <Star
                      size={20}
                      className={
                        v <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs text-gray-500">
                  {rating} / 5 sao
                </span>
              </div>

              {isLoadingReview && (
                <p className="mt-1 text-xs text-gray-400">
                  Đang tải đánh giá...
                </p>
              )}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Tiêu đề (không bắt buộc)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ví dụ: Sản phẩm tốt, đáng tiền..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Nội dung đánh giá
            </label>
            <textarea
              className="h-28 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Ảnh đính kèm - upload từ máy */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Ảnh đính kèm
            </label>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50">
                <Plus size={14} />
                <span>Chọn ảnh từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploadingImages}
                />
              </label>
              {isUploadingImages && (
                <span className="text-xs text-gray-500">
                  Đang upload ảnh...
                </span>
              )}
            </div>

            {/* Preview ảnh */}
            {imageUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border bg-gray-50"
                  >
                    <img
                      src={url}
                      alt={`review-${idx}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 m-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black cursor-pointer"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={onClose}
              disabled={isSaving || isUploadingImages}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingImages}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {isSaving
                ? "Đang lưu..."
                : review
                ? "Lưu thay đổi"
                : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
