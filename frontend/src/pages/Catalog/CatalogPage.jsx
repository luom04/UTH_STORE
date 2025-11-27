// src/pages/Catalog/CatalogPage.jsx
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard.jsx";
import CategoriesSection from "../../components/Categories/CategoriesSection.jsx";
import { useCatalogProducts } from "../../hooks/useProductsPublic.js";
import { useCategoryBySlug } from "../../hooks/useCategories.js";
import Button from "../../components/Button/Button.jsx";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

export default function CatalogPage() {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || PAGE_SIZE);
  const sort = sp.get("sort") || "-updatedAt";

  const categorySlug = decodeURIComponent(slug || "").toLowerCase();

  // ✅ NEW: Local loading state
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { category, isLoading: isLoadingCategory } =
    useCategoryBySlug(categorySlug);

  const { data, isLoading, isError, isFetching } = useCatalogProducts({
    page,
    limit,
    sort,
    category: categorySlug,
    fields:
      "title,slug,images,price,priceSale,discountPercent,brand,category,specs,rating,ratingCount,reviewsCount",
  });

  const list = data?.list || [];
  const meta = data?.meta || { page, limit };

  const view = useMemo(() => {
    return list.map((p) => {
      return {
        id: p.id || p._id,
        slug: p.slug,
        title: p.title,
        image:
          Array.isArray(p.images) && p.images.length
            ? p.images[0]
            : p.image || "/no-image.png",
        images: p.images || [],
        price: p.price,
        priceSale: p.priceSale,
        discountPercent: p.discountPercent || 0,
        rating: p.rating || 0,
        ratingCount: p.ratingCount || p.reviewsCount || 0,
        specs: p.specs || {},
        category: p.category,
        brand: p.brand,
      };
    });
  }, [list]);

  const canLoadMore = (meta?.limit ?? limit) <= list.length;

  // ✅ NEW: Handle load more with delay
  const onLoadMore = async () => {
    setIsLoadingMore(true);

    // Delay 500ms để hiển thị spinner
    await new Promise((resolve) => setTimeout(resolve, 500));

    const next = new URLSearchParams(sp);
    next.set("limit", String(limit + PAGE_SIZE));
    setSp(next, { replace: true });

    setIsLoadingMore(false);
  };

  const categoryDisplayName = category?.name || categorySlug;

  return (
    <div className="overflow-x-hidden">
      {/* Banner (full-bleed, nằm ngoài container để full screen) */}
      <div className="mb-6">
        {isLoadingCategory ? (
          // Skeleton full-bleed
          <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen">
            <div className="h-[28vh] min-h-[220px] max-h-[420px] bg-gray-100 animate-pulse" />
          </section>
        ) : category?.banner ? (
          <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen">
            <div className="relative h-[28vh] min-h-[220px] max-h-[420px] sm:h-[36vh] md:h-[44vh] overflow-hidden">
              {/* Lớp nền blur: fill toàn khung, object-cover để trông hiện đại */}
              <img
                src={category.banner}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-60"
                referrerPolicy="no-referrer"
                decoding="async"
              />
              {/* Ảnh chính: object-contain để KHÔNG MẤT ẢNH */}
              <img
                src={category.banner}
                alt={categoryDisplayName}
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="relative z-10 mx-auto h-full max-w-[95%] object-contain"
                style={{ objectPosition: "center" }}
              />

              {/* Chip số lượng sản phẩm (glassmorphism, nhẹ) */}
              {!isLoading && (
                <div className="absolute bottom-4 right-4 z-20">
                  <span className="inline-block rounded-full bg-white/70 backdrop-blur-md px-3 py-1 text-sm font-medium text-gray-800 shadow">
                    {list.length} sản phẩm
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          // Fallback khi không có banner: dùng container như cũ
          <div className="max-w-6xl mx-auto px-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-xs text-gray-500">Danh mục</div>
              <h1 className="text-2xl md:text-3xl font-bold capitalize">
                {categoryDisplayName}
              </h1>
              {!isLoading && (
                <p className="text-sm text-gray-600 mt-1">
                  {list.length} sản phẩm
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-white p-6 shadow-sm text-red-600">
            ❌ Không tải được sản phẩm. Vui lòng thử lại.
          </div>
        ) : view.length === 0 ? (
          <div className="rounded-xl bg-white p-8 shadow-sm text-center text-gray-600">
            📦 Chưa có sản phẩm trong danh mục này.
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {view.map((p) => (
                <ProductCard key={p.slug || p.id} p={p} />
              ))}
            </div>

            {/* Load More */}
            {canLoadMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={onLoadMore}
                  disabled={isLoadingMore || isFetching}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-red-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoadingMore || isFetching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                    </>
                  ) : (
                    "Xem thêm sản phẩm"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto px-3 mt-8">
        <CategoriesSection />
      </div>
    </div>
  );
}
