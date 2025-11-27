// src/pages/Search/Search.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard.jsx";
import { Loader2 } from "lucide-react";
import { useProductSearch } from "../../hooks/useProductsPublic";
import Button from "../../components/Button/Button.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const q = (params.get("q") || "").trim();

  const [keyword, setKeyword] = useState(q);
  const [limit, setLimit] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // ✅ NEW: Local loading state

  useEffect(() => {
    setKeyword(q);
    setLimit(20);
  }, [q]);

  const { data, isLoading, isFetching, isError } = useProductSearch({
    q,
    limit,
  });

  const products = data?.list || [];
  const totalResults = data?.total || 0;
  const canLoadMore = products.length < totalResults;

  const submit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const next = new URLSearchParams(params);
    next.set("q", keyword.trim());
    setParams(next, { replace: true });
  };

  // ✅ NEW: Handle load more with delay
  const handleLoadMore = async () => {
    setIsLoadingMore(true);

    // Delay 500ms để hiển thị spinner
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLimit((prev) => prev + 8);
    setIsLoadingMore(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 py-6 min-h-[60vh]">
      <h1 className="text-center text-2xl font-bold uppercase text-gray-800">
        Kết quả tìm kiếm
      </h1>
      <p className="mt-1 text-center text-sm text-gray-600">
        {q ? (
          <>
            Đang tìm kiếm:{" "}
            <span className="font-semibold text-red-600">"{q}"</span>
          </>
        ) : (
          "Nhập tên sản phẩm để bắt đầu..."
        )}
      </p>

      {/* Form Search */}
      <form onSubmit={submit} className="mt-4 mx-auto flex max-w-xl gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
          placeholder="Bạn muốn tìm gì?..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          className="rounded-lg bg-red-600 px-5 py-2 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-70"
          disabled={!keyword.trim()}
        >
          Tìm kiếm
        </button>
      </form>

      {isLoading ? (
        <div className="mt-12 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-2" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : isError ? (
        <div className="mt-8 text-center text-red-500">
          Lỗi kết nối. Vui lòng thử lại sau.
        </div>
      ) : (
        <>
          {q && products.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-10 text-center border border-gray-100">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                alt="Not found"
                className="w-16 h-16 opacity-50 mb-3"
              />
              <p className="text-gray-600">
                Không tìm thấy sản phẩm nào cho từ khóa <b>"{q}"</b>.
              </p>
              <button
                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                onClick={() => {
                  setKeyword("");
                  navigate("/products", { replace: true });
                }}
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <>
              {q && (
                <div className="mt-4 text-sm text-gray-500 text-right">
                  Tìm thấy <b>{totalResults}</b> kết quả
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>

              {canLoadMore && (
                <div className="mt-8 text-center">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore || isFetching}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-red-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
        </>
      )}
    </div>
  );
}
