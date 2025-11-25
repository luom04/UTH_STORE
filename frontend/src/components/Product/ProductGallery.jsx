// src/components/product/ProductGallery.jsx
import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const MAX_VISIBLE_THUMBS = 5;

export default function ProductGallery({ images = [], title = "" }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);

  // Fallback nếu không có ảnh
  const displayImages =
    images.length > 0
      ? images
      : ["https://via.placeholder.com/600x400?text=No+Image"];

  const total = displayImages.length;

  // Reset khi đổi product/images
  useEffect(() => {
    setCurrentIndex(0);
    setThumbStart(0);
  }, [images]);

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // Đảm bảo window thumbnail luôn chứa currentIndex
  useEffect(() => {
    if (currentIndex < thumbStart) {
      setThumbStart(currentIndex);
    } else if (currentIndex >= thumbStart + MAX_VISIBLE_THUMBS) {
      setThumbStart(currentIndex - (MAX_VISIBLE_THUMBS - 1));
    }
  }, [currentIndex, thumbStart]);

  // ✅ Giờ dùng currentIndex để quyết định có ấn được nút hay không
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < total - 1;

  const visibleThumbs = displayImages.slice(
    thumbStart,
    thumbStart + MAX_VISIBLE_THUMBS
  );

  const handleThumbClick = (realIndex) => {
    setCurrentIndex(realIndex);
  };

  // ✅ 2 nút `< >` giờ sẽ đổi luôn currentIndex (ảnh lớn cũng đổi theo)
  const handleThumbPrev = () => {
    if (!canScrollLeft) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleThumbNext = () => {
    if (!canScrollRight) return;
    setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
  };

  // Custom arrow components cho carousel ảnh lớn
  const CustomPrevArrow = (onClickHandler, hasPrev) => {
    if (!hasPrev) return null;
    return (
      <button
        type="button"
        onClick={onClickHandler}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                   bg-black/50 hover:bg-black/70 text-white rounded-full p-2
                   transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Previous image"
      >
        <ChevronLeft size={24} />
      </button>
    );
  };

  const CustomNextArrow = (onClickHandler, hasNext) => {
    if (!hasNext) return null;
    return (
      <button
        type="button"
        onClick={onClickHandler}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                   bg-black/50 hover:bg-black/70 text-white rounded-full p-2
                   transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Next image"
      >
        <ChevronRight size={24} />
      </button>
    );
  };

  return (
    <>
      <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Ảnh lớn */}
        <Carousel
          showArrows={displayImages.length > 1}
          showStatus={false}
          showIndicators={false}
          showThumbs={false} // dùng thumbnail custom
          infiniteLoop
          useKeyboardArrows
          swipeable
          emulateTouch
          renderArrowPrev={CustomPrevArrow}
          renderArrowNext={CustomNextArrow}
          selectedItem={currentIndex}
          onChange={(index) => setCurrentIndex(index)}
        >
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="relative h-[420px] bg-gray-50 cursor-zoom-in"
              onClick={() => handleImageClick(idx)}
            >
              <img
                src={img}
                alt={`${title} - Ảnh ${idx + 1}`}
                className="w-full h-full object-contain"
              />
              {/* Zoom icon overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity bg-black/10"
              >
                <div className="bg-white/90 rounded-full p-3">
                  <ZoomIn size={24} className="text-gray-800" />
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Thumbnails: tối đa 5 + nút ‹ ›, căn giữa dưới ảnh lớn */}
        {total > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 px-3 pb-3">
            {total > MAX_VISIBLE_THUMBS && (
              <button
                type="button"
                onClick={handleThumbPrev}
                disabled={!canScrollLeft}
                className={`flex items-center justify-center w-8 h-8 rounded-full border
                            transition-all ${
                              canScrollLeft
                                ? "border-gray-300 hover:border-red-400"
                                : "border-gray-200 opacity-40 cursor-default"
                            }`}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <div className="flex gap-2">
              {visibleThumbs.map((img, idx) => {
                const realIndex = thumbStart + idx;
                const isActive = realIndex === currentIndex;

                return (
                  <button
                    key={realIndex}
                    onClick={() => handleThumbClick(realIndex)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      isActive
                        ? "border-red-500 scale-110"
                        : "border-gray-200 hover:border-red-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${realIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {total > MAX_VISIBLE_THUMBS && (
              <button
                type="button"
                onClick={handleThumbNext}
                disabled={!canScrollRight}
                className={`flex items-center justify-center w-8 h-8 rounded-full border
                            transition-all ${
                              canScrollRight
                                ? "border-gray-300 hover:border-red-400"
                                : "border-gray-200 opacity-40 cursor-default"
                            }`}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox fullscreen */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={displayImages.map((img) => ({ src: img }))}
        index={currentIndex}
        on={{
          view: ({ index }) => setCurrentIndex(index),
        }}
      />
    </>
  );
}
