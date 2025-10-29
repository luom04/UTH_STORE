// src/pages/Catalog/CatalogPage.jsx
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard.jsx";

// ===== Mock: bạn có thể thay bằng react-query sau này
const MOCK_PRODUCTS = [
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

// hoặc gom từ backend thực tế

// ---------- Helpers ----------
const BRANDS = [
  "ASUS",
  "Acer",
  "MSI",
  "Lenovo",
  "HP",
  "Dell",
  "LG",
  "Gigabyte",
  "Razer",
  "Leobog",
  "Keychron",
];

const parseInch = (txt = "") => {
  // 15.6, 24 inch, 27", 34-inch
  const m = String(txt).match(/(\d{2}(?:\.\d)?)\s*(?:inch|"|-inch)/i); // Sửa ở đây
  return m ? m[1] : null;
};
const hasGPU = (c) => /(RTX|GTX|RX)\s*\d/i.test(c);
const hasCPU = (c) => /(i[3579]-?\d{4,5}|Ryzen\s?\d)/i.test(c);

function buildFacets(list) {
  const brands = new Set();
  const inches = new Set();
  const cpus = new Set();
  const gpus = new Set();
  const others = new Set();

  list.forEach((p) => {
    // brand từ title
    const b = BRANDS.find((b) => new RegExp(`\\b${b}\\b`, "i").test(p.title));
    if (b) brands.add(b);

    // inch từ chips hoặc title
    const inchFromTitle = parseInch(p.title);
    if (inchFromTitle) inches.add(inchFromTitle);
    p.chips?.forEach((ch) => {
      const inch = parseInch(ch);
      if (inch) inches.add(inch);
      if (hasCPU(ch)) cpus.add(ch);
      else if (hasGPU(ch)) gpus.add(ch);
      else others.add(ch);
    });
  });

  // Lọc others: bỏ token quá chung chung
  const bad = [
    /^RGB$/i,
    /^Wireless$/i,
    /^\d+GB$/i,
    /^\d+TB$/i,
    /^H61/i,
    /^B\d+/i,
  ];
  const othersClean = [...others].filter((o) => !bad.some((r) => r.test(o)));

  return {
    price: { key: "price", label: "Giá" },
    brand:
      brands.size > 0
        ? { key: "brand", label: "Hãng", options: [...brands].sort() }
        : null,
    inch:
      inches.size > 1
        ? {
            key: "inch",
            label: "Kích thước",
            options: [...inches]
              .sort((a, b) => parseFloat(a) - parseFloat(b))
              .map((i) => `${i} inch`),
          }
        : null,
    cpu:
      cpus.size > 1 ? { key: "cpu", label: "CPU", options: [...cpus] } : null,
    gpu:
      gpus.size > 1 ? { key: "gpu", label: "GPU", options: [...gpus] } : null,
    misc:
      othersClean.length > 2
        ? {
            key: "misc",
            label: "Thuộc tính",
            options: othersClean.slice(0, 20),
          }
        : null,
  };
}

function applyFilters(list, filters, price) {
  return list.filter((p) => {
    // price
    if (price) {
      const ok = p.price >= price.min && p.price <= price.max;
      if (!ok) return false;
    }
    // brand
    if (filters.brand?.length) {
      const ok = filters.brand.some((b) =>
        new RegExp(`\\b${b}\\b`, "i").test(p.title)
      );
      if (!ok) return false;
    }
    // inch
    if (filters.inch?.length) {
      const ptoks = new Set(
        [parseInch(p.title), ...(p.chips?.map(parseInch) ?? [])]
          .filter(Boolean)
          .map((i) => `${i} inch`)
      );
      const ok = filters.inch.some((v) => ptoks.has(v));
      if (!ok) return false;
    }
    // cpu
    if (filters.cpu?.length) {
      const ok = filters.cpu.some((v) =>
        p.chips?.some((c) => c.toLowerCase() === v.toLowerCase())
      );
      if (!ok) return false;
    }
    // gpu
    if (filters.gpu?.length) {
      const ok = filters.gpu.some((v) =>
        p.chips?.some((c) => c.toLowerCase() === v.toLowerCase())
      );
      if (!ok) return false;
    }
    // misc (any token in chips)
    if (filters.misc?.length) {
      const set = new Set(p.chips || []);
      const ok = filters.misc.some((v) => set.has(v));
      if (!ok) return false;
    }
    return true;
  });
}

// ---------- Modal ----------
function Overlay({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-16 -translate-x-1/2 w-[min(680px,92vw)] rounded-2xl bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

function ChoiceGrid({ options = [], selected = [], onToggle }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((op) => (
        <button
          key={op}
          onClick={() => onToggle(op)}
          className={
            "rounded-lg border px-3 py-2 text-sm " +
            (selected.includes(op)
              ? "border-emerald-500 bg-emerald-50"
              : "hover:bg-gray-50")
          }
        >
          {op}
        </button>
      ))}
    </div>
  );
}

function PriceModal({ open, onClose, priceRange, onApply }) {
  const [min, setMin] = useState(priceRange.min);
  const [max, setMax] = useState(priceRange.max);
  const canApply = min <= max;
  return (
    <Overlay open={open} onClose={onClose}>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-4">Chọn khoảng giá</h3>
        <div className="flex gap-3">
          <input
            className="w-1/2 rounded-lg border px-3 py-2"
            type="number"
            value={min}
            onChange={(e) => setMin(+e.target.value || 0)}
          />
          <input
            className="w-1/2 rounded-lg border px-3 py-2"
            type="number"
            value={max}
            onChange={(e) => setMax(+e.target.value || 0)}
          />
        </div>
        <div className="mt-5 flex justify-between">
          <button
            onClick={() => {
              setMin(priceRange.min);
              setMax(priceRange.max);
            }}
            className="rounded-lg border px-4 py-2"
          >
            Bỏ chọn
          </button>
          <button
            disabled={!canApply}
            onClick={() => {
              onApply({ min, max });
              onClose();
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Xem kết quả
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function OptionsModal({
  open,
  onClose,
  title,
  facetKey,
  options,
  selected = [],
  onApply,
}) {
  const [local, setLocal] = useState(selected);
  const toggle = (v) =>
    setLocal((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  return (
    <Overlay open={open} onClose={onClose}>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <ChoiceGrid options={options} selected={local} onToggle={toggle} />
        <div className="mt-5 flex justify-between">
          <button
            onClick={() => setLocal([])}
            className="rounded-lg border px-4 py-2"
          >
            Bỏ chọn
          </button>
          <button
            disabled={local.length === 0}
            onClick={() => {
              onApply(facetKey, local);
              onClose();
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Xem kết quả
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- Main ----------
export default function CatalogPage() {
  const { slug } = useParams();

  const allProducts = MOCK_PRODUCTS;

  // Phạm vi giá mặc định theo data
  const minP = Math.min(...allProducts.map((p) => p.price));
  const maxP = Math.max(...allProducts.map((p) => p.price));

  const [filters, setFilters] = useState({
    brand: [],
    inch: [],
    cpu: [],
    gpu: [],
    misc: [],
  });
  const [price, setPrice] = useState({ min: minP, max: maxP });

  const facets = useMemo(() => buildFacets(allProducts), [allProducts]);

  const filtered = useMemo(
    () => applyFilters(allProducts, filters, price),
    [allProducts, filters, price]
  );

  // phân trang “xem thêm”
  const [visible, setVisible] = useState(15);
  const canMore = filtered.length > visible;
  const showing = filtered.slice(0, visible);

  // modal states
  const [openPrice, setOpenPrice] = useState(false);
  const [openFacet, setOpenFacet] = useState(null); // {key, label, options}

  const applyFacet = (key, values) =>
    setFilters((f) => ({ ...f, [key]: values }));

  // Chip đã chọn -> viền xanh
  const picked = (key) => filters[key]?.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      {/* Banner nhỏ theo slug (optional) */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-pink-50 border p-4 mb-4">
        <div className="text-sm text-gray-500">Danh mục</div>
        <h1 className="text-2xl font-bold">{slug || "collections"}</h1>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Giá */}
        <button
          onClick={() => setOpenPrice(true)}
          className={`rounded-lg border px-3 py-2 text-sm ${
            picked("price") || price.min !== minP || price.max !== maxP
              ? "border-emerald-500"
              : "hover:bg-gray-50"
          }`}
        >
          Giá
        </button>

        {/* Các facet động */}
        {Object.values(facets)
          .filter(Boolean)
          .filter((f) => f.key !== "price")
          .map((f) => (
            <button
              key={f.key}
              onClick={() => setOpenFacet(f)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                picked(f.key) ? "border-emerald-500" : "hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
      </div>

      {/* Grid 5 cột */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {showing.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {/* Xem thêm */}
      <div className="mt-6 text-center">
        {canMore ? (
          <button
            onClick={() => setVisible((v) => v + 15)}
            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
          >
            Xem thêm sản phẩm
          </button>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</div>
        ) : null}
      </div>

      {/* Modals */}
      <PriceModal
        open={openPrice}
        onClose={() => setOpenPrice(false)}
        priceRange={{ min: price.min, max: price.max }}
        onApply={(v) => setPrice(v)}
      />
      {openFacet && (
        <OptionsModal
          open={!!openFacet}
          onClose={() => setOpenFacet(null)}
          title={openFacet.label}
          facetKey={openFacet.key}
          options={openFacet.options}
          selected={filters[openFacet.key] || []}
          onApply={applyFacet}
        />
      )}
    </div>
  );
}
