// src/pages/Catalog/CatalogPage.jsx
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCard.jsx";
import CategoriesSection from "../../components/Categories/CategoriesSection.jsx";
import { useCatalogProducts } from "../../hooks/useProductsPublic.js";
import { useCategoryBySlug } from "../../hooks/useCategories.js";
import Button from "../../components/Button/Button.jsx";
import { Loader2, PackageOpen } from "lucide-react";

const PAGE_SIZE = 20;

export default function CatalogPage() {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();

  // 1. Lấy thông số phân trang và sắp xếp từ URL
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || PAGE_SIZE);
  const sort = sp.get("sort") || "-updatedAt";

  const categorySlug = decodeURIComponent(slug || "").toLowerCase();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Lấy thông tin danh mục (Banner, Name)
  const { category, isLoading: isLoadingCategory } =
    useCategoryBySlug(categorySlug);

  // 2. Gọi API lấy danh sách sản phẩm (Đã gỡ bỏ rating)
  const { data, isLoading, isError, isFetching } = useCatalogProducts({
    page,
    limit,
    sort,
    category: categorySlug,
    fields:
      "title,slug,images,price,priceSale,discountPercent,brand,category,rating,ratingCount,reviewsCount,sold,specs",
  });

  const list = data?.list || [];
  const meta = data?.meta || { page, limit };

  // 3. Xử lý dữ liệu hiển thị
  const view = useMemo(() => {
    return list.map((p) => ({
      ...p,
      id: p.id || p._id,
      image:
        Array.isArray(p.images) && p.images.length
          ? p.images[0]
          : "/no-image.png",
    }));
  }, [list]);

  const canLoadMore = (meta?.total || 0) > list.length;

  // 4. Hàm xử lý tải thêm sản phẩm
  const onLoadMore = async () => {
    setIsLoadingMore(true);
    // Delay nhẹ để người dùng thấy hiệu ứng loading
    await new Promise((resolve) => setTimeout(resolve, 500));

    const next = new URLSearchParams(sp);
    next.set("limit", String(limit + PAGE_SIZE));
    setSp(next, { replace: true });

    setIsLoadingMore(false);
  };

  const categoryDisplayName = category?.name || categorySlug;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      {/* --- BANNER SECTION (Full-bleed) --- */}
      <div className="mb-6">
        {isLoadingCategory ? (
          <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen">
            <div className="h-[28vh] min-h-[220px] max-h-[420px] bg-gray-200 animate-pulse" />
          </section>
        ) : category?.banner ? (
          <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen">
            <div className="relative h-[28vh] min-h-[220px] max-h-[420px] sm:h-[36vh] md:h-[44vh] overflow-hidden bg-black">
              {/* Lớp nền blur */}
              <img
                src={category.banner}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-60"
              />
              {/* Ảnh banner chính */}
              <img
                src={category.banner}
                alt={categoryDisplayName}
                className="relative z-10 mx-auto h-full max-w-[95%] object-contain"
              />
              {/* Chip số lượng */}
              {!isLoading && (
                <div className="absolute bottom-4 right-8 z-20">
                  <span className="inline-block rounded-full bg-white/80 backdrop-blur-md px-4 py-1.5 text-sm font-bold text-gray-800 shadow-sm">
                    {meta?.total || 0} sản phẩm
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                Danh mục
              </div>
              <h1 className="text-3xl font-black capitalize text-gray-900">
                {categoryDisplayName}
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Toolbar: Tiêu đề & Sắp xếp */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-gray-800 capitalize">
              {categoryDisplayName}
            </h2>
            <p className="text-gray-400 text-xs mt-1 font-medium">
              Đang hiển thị {list.length} kết quả
            </p>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <span className="text-sm text-gray-500 font-bold whitespace-nowrap">
              Sắp xếp theo:
            </span>
            <select
              value={sort}
              onChange={(e) => {
                const next = new URLSearchParams(sp);
                next.set("sort", e.target.value);
                next.set("page", "1");
                setSp(next);
              }}
              className="bg-gray-50 border-none text-sm font-extrabold text-gray-700 py-2.5 px-5 rounded-xl focus:ring-2 focus:ring-red-100 cursor-pointer outline-none"
            >
              <option value="-updatedAt">Mới nhất</option>
              <option value="priceSale">Giá: Thấp đến Cao</option>
              <option value="-priceSale">Giá: Cao đến Thấp</option>
              <option value="-sold">Bán chạy nhất</option>
            </select>
          </div>
        </div>

        {/* Grid sản phẩm (Full width - 5 cột trên Desktop) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white animate-pulse border border-gray-100 shadow-sm"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold border border-red-100">
            ❌ Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.
          </div>
        ) : view.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg">
              Danh mục hiện đang trống
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Chúng tôi sẽ sớm cập nhật sản phẩm mới vào mục này.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {view.map((p) => (
                <ProductCard key={p.slug || p.id} p={p} />
              ))}
            </div>

            {/* Nút Xem thêm */}
            {canLoadMore && (
              <div className="mt-16 text-center">
                <Button
                  variant="secondary"
                  onClick={onLoadMore}
                  disabled={isLoadingMore || isFetching}
                  className="px-16 py-4 rounded-full border-2 border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 font-black transition-all shadow-sm active:scale-95 flex items-center gap-3 mx-auto"
                >
                  {isLoadingMore || isFetching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ
                      liệu...
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

      {/* Categories gợi ý ở cuối trang */}
      <div className="max-w-7xl mx-auto px-4 mt-24">
        <CategoriesSection />
      </div>
    </div>
  );
}
