// src/pages/Search/Search.jsx
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard.jsx";

const ALL_PRODUCTS = [
  {
    id: "p1",
    title: "PC GVN i5-12400F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    chips: ["i5 12400F", "B760", "16GB", "500GB", "RTX 3050"],
  },
  {
    id: "p2",
    title: "PC GVN i3-12100F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=800&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    chips: ["i3 12100F", "H610", "8GB", "250GB", "RTX 3050"],
  },
  {
    id: "p3",
    title: "PC GVN x MSI PROJECT ZERO WHITE",
    image:
      "https://images.unsplash.com/photo-1593642634367-d91a1355875?q=80&w=800&auto=format&fit=crop",
    price: 30990000,
    oldPrice: 33020000,
    chips: ["i5 14400F", "B760", "16GB", "1TB", "RTX 4060"],
  },
  {
    id: "p4",
    title: "PC GVN i3-12100F / RX 6500XT",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    price: 10490000,
    oldPrice: 11430000,
    chips: ["i3 12100F", "RX 6500XT", "8GB", "250GB"],
  },
  {
    id: "p5",
    title: "PC GVN i5-12400F / RTX 3060",
    image:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop",
    price: 16890000,
    oldPrice: 18620000,
    chips: ["i5 12400F", "B760", "16GB", "500GB", "RTX 3060"],
  },
  {
    id: "p6",
    title: "PC GVN i5-13400F / RTX 4060",
    image:
      "https://images.unsplash.com/photo-1614064641938-3bbee52958a5?q=80&w=800&auto=format&fit=crop",
    price: 21990000,
    oldPrice: 23990000,
    chips: ["i5 13400F", "B760", "16GB", "500GB", "RTX 4060"],
  },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get("q") || "").trim();
  const [keyword, setKeyword] = useState(q);
  const [limit, setLimit] = useState(10);

  useEffect(() => setKeyword(q), [q]);

  const filtered = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return ALL_PRODUCTS.filter((p) => {
      const t = p.title?.toLowerCase().includes(lower);
      const c = (p.chips || []).some((x) =>
        String(x).toLowerCase().includes(lower)
      );
      return t || c;
    });
  }, [q]);

  const visible = filtered.slice(0, limit);
  const canLoadMore = filtered.length > limit;

  const submit = (e) => {
    e.preventDefault();
    setLimit(10);
    const next = new URLSearchParams(params);
    keyword ? next.set("q", keyword) : next.delete("q");
    setParams(next, { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <h1 className="text-center text-2xl font-bold">TÌM KIẾM</h1>
      <p className="mt-1 text-center text-sm text-gray-600">
        {q ? (
          <>
            Tìm kiếm theo:{" "}
            <span className="font-medium text-gray-900">{q}</span>
          </>
        ) : (
          "Nhập từ khóa để bắt đầu tìm kiếm"
        )}
      </p>

      <form onSubmit={submit} className="mt-3 mx-auto flex max-w-xl gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder="Nhập từ khóa…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700">
          Tìm kiếm
        </button>
      </form>

      {q &&
        (filtered.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
            Không tìm thấy sản phẩm phù hợp.
            <button
              className="ml-2 text-blue-600 underline"
              onClick={() => {
                setKeyword("");
                navigate("/search", { replace: true });
              }}
            >
              Xóa từ khóa
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`}>
                  <ProductCard p={p} />
                </Link>
              ))}
            </div>
            {canLoadMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setLimit((n) => n + 10)}
                  className="rounded-lg border px-5 py-2.5 font-medium hover:bg-gray-50"
                >
                  Xem thêm sản phẩm
                </button>
              </div>
            )}
          </>
        ))}
    </div>
  );
}
