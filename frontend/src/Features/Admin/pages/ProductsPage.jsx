// src/Features/Admin/pages/ProductsPage.jsx
import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useAdminProducts,
  useUpsertProduct,
  useDeleteProduct,
  useUpdateStock,
} from "../hooks/useProducts";
import ProductsFilters from "../components/products/ProductsFilters.jsx";
import ProductsTable from "../components/products/ProductsTable.jsx";
import ProductModal from "../components/products/ProductModal.jsx";

export default function ProductsPage() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, isError, refetch } = useAdminProducts({
    page,
    limit: 20,
    q,
    stock: stockFilter,
  });

  const upsertMut = useUpsertProduct();
  const stockMut = useUpdateStock();
  const delMut = useDeleteProduct();

  const list = useMemo(() => {
    const items = data?.data || [];
    return items.map((p) => ({
      id: p.id || p._id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      images: Array.isArray(p.images) ? p.images : [],
      image:
        Array.isArray(p.images) && p.images.length ? p.images[0] : undefined,
      status: p.status,
      active: p.status === "active",
      isFeatured: !!p.isFeatured,
      description: p.description || "",
      updatedAt: p.updatedAt,
      specs: p.specs,
    }));
  }, [data]);

  const meta = data?.meta || { page: 1, limit: 20, total: list.length };

  return (
    <div>
      {/* Header + actions */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý sản phẩm</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-2 text-sm flex items-center gap-2"
            onClick={() => refetch()}
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          {isAdmin && (
            <button
              className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm flex items-center gap-2"
              onClick={() => {
                setEditing(null);
                setOpenModal(true);
              }}
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
          )}
        </div>
      </div>

      {/* Bộ lọc */}
      <ProductsFilters
        q={q}
        setQ={setQ}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        setPage={setPage}
      />

      {/* Bảng */}
      <ProductsTable
        isLoading={isLoading}
        isError={isError}
        list={list}
        meta={meta}
        onEdit={(p) => {
          setEditing(p);
          setOpenModal(true);
        }}
        onDelete={(id) => {
          if (confirm("Xoá sản phẩm này?")) delMut.mutate(id);
        }}
        onInc={(id) => stockMut.mutate({ id, diff: +1 })}
        onDec={(id) => stockMut.mutate({ id, diff: -1 })}
        canDelete={isAdmin}
      />

      {/* Phân trang */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Trang trước
        </button>
        <div className="text-sm text-gray-600">Trang {meta.page}</div>
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={(data?.data?.length || 0) < (meta.limit || 20)}
        >
          Trang sau
        </button>
      </div>

      {/* Modal thêm/sửa */}
      <ProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        initial={editing}
        onSave={(payload) =>
          upsertMut.mutate(payload, {
            onSuccess: () => {
              setOpenModal(false);
              setEditing(null);
            },
          })
        }
        canEditAll={isAdmin}
      />
    </div>
  );
}
