// src/Features/Admin/pages/ProductsPage.jsx
// ✅ PHÂN QUYỀN: Admin (full) | Staff (chỉ update stock)

import { useMemo, useState, useEffect } from "react";
import { Plus, FolderPlus, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import {
  useAdminProducts,
  useUpsertProduct,
  useDeleteProduct,
  useUpdateStock,
} from "../hooks/useProducts";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../hooks/useCategories";
import ProductsFilters from "../components/products/ProductsFilters.jsx";
import ProductsTable from "../components/products/ProductsTable.jsx";
import ProductModal from "../components/products/ProductModal.jsx";
import CategoryModal from "../components/categories/CategoryModal.jsx";

export default function ProductsPage() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  // ✅ READ URL PARAMS
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);

  // ✅ Product Modal (chỉ Admin)
  const [openProductModal, setOpenProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ Category Modal (chỉ Admin)
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // ✅ Sync categoryFilter with URL
  useEffect(() => {
    setCategoryFilter(categoryFromUrl);
    setPage(1);
  }, [categoryFromUrl]);

  // ✅ Fetch categories
  const { categories, isLoading: categoriesLoading } = useCategories();

  // ✅ Fetch products
  const { data, isLoading, isError } = useAdminProducts({
    page,
    limit: 10,
    q,
    stock: stockFilter,
    category: categoryFilter,
  });

  // ✅ Mutations
  const upsertProductMut = useUpsertProduct();
  const stockMut = useUpdateStock();
  const deleteProductMut = useDeleteProduct();
  const createCategoryMut = useCreateCategory();
  const updateCategoryMut = useUpdateCategory();
  const deleteCategoryMut = useDeleteCategory();

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

  // Get active category info
  const activeCategory = categories.find((cat) => cat.slug === categoryFilter);

  // ✅ Handle category tab click
  const handleCategoryChange = (slug) => {
    setCategoryFilter(slug);
    setPage(1);

    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  // ✅ Handle save category (Admin only)
  const handleSaveCategory = (data) => {
    if (editingCategory) {
      updateCategoryMut.mutate(
        { id: editingCategory._id, ...data },
        {
          onSuccess: () => {
            setOpenCategoryModal(false);
            setEditingCategory(null);
          },
        }
      );
    } else {
      createCategoryMut.mutate(data, {
        onSuccess: () => {
          setOpenCategoryModal(false);
        },
      });
    }
  };

  // ✅ Handle delete category (Admin only)
  const handleDeleteCategory = (cat) => {
    if (cat.productCount > 0) {
      alert(
        `❌ Không thể xóa "${cat.name}"\n\nDanh mục này còn ${cat.productCount} sản phẩm.`
      );
      return;
    }

    const confirmed = confirm(
      `⚠️ Xóa danh mục "${cat.name}"?\n\nHành động này không thể hoàn tác.`
    );

    if (confirmed) {
      deleteCategoryMut.mutate(cat._id, {
        onSuccess: () => {
          if (categoryFilter === cat.slug) {
            handleCategoryChange("");
          }
        },
      });
    }
  };

  return (
    <div>
      {/* ✅ HEADER */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Quản lý sản phẩm
            </h1>
            {activeCategory && (
              <p className="mt-1 text-sm text-gray-600">
                Danh mục:{" "}
                <span className="font-medium">{activeCategory.name}</span>
              </p>
            )}
          </div>

          {/* ✅ ACTION BUTTONS - CHỈ ADMIN */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {/* Add Category Button */}
              <button
                className="rounded-lg bg-white border-2 border-blue-600 text-blue-600 px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => {
                  setEditingCategory(null);
                  setOpenCategoryModal(true);
                }}
                title="Thêm danh mục mới"
              >
                <FolderPlus size={18} />
                Thêm danh mục
              </button>

              {/* Add Product Button */}
              <button
                className="rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm cursor-pointer"
                onClick={() => {
                  setEditingProduct(null);
                  setOpenProductModal(true);
                }}
                title="Thêm sản phẩm mới"
              >
                <Plus size={18} />
                Thêm sản phẩm
              </button>
            </div>
          )}
        </div>

        {/* ✅ Category Pills */}
        {categoriesLoading ? (
          <div className="text-sm text-gray-500">Đang tải danh mục...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {/* All categories button */}
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                categoryFilter === ""
                  ? "bg-blue-600 text-white shadow-sm "
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500 "
              }`}
              onClick={() => handleCategoryChange("")}
            >
              Tất cả
              <span className="ml-1.5 opacity-75">({meta.total})</span>
            </button>

            {/* Category pills */}
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`flex items-center gap-1 pl-4 pr-1 py-2 rounded-lg text-sm font-medium transition group ${
                  categoryFilter === cat.slug
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500"
                }`}
              >
                {/* Category name - clickable */}
                <button
                  className="flex-1 cursor-pointer"
                  onClick={() => handleCategoryChange(cat.slug)}
                  onContextMenu={(e) => {
                    // ✅ Right-click to edit - CHỈ ADMIN
                    if (isAdmin) {
                      e.preventDefault();
                      setEditingCategory(cat);
                      setOpenCategoryModal(true);
                    }
                  }}
                  title={
                    isAdmin ? "Click: Lọc | Right-click: Sửa" : "Click để lọc"
                  }
                >
                  {cat.name}
                  {cat.productCount > 0 && (
                    <span className="ml-1.5 opacity-75">
                      ({cat.productCount})
                    </span>
                  )}
                </button>

                {/* ✅ Delete button - CHỈ ADMIN */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat);
                    }}
                    disabled={cat.productCount > 0}
                    className={`p-1 rounded hover:bg-red-100 transition ${
                      categoryFilter === cat.slug
                        ? "text-white hover:bg-red-500"
                        : "text-gray-400 hover:text-red-600"
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                    title={
                      cat.productCount > 0
                        ? `Không thể xóa (còn ${cat.productCount} sản phẩm)`
                        : `Xóa "${cat.name}"`
                    }
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ✅ Helper text - CHỈ ADMIN */}
        {isAdmin && (
          <p className="mt-2 text-xs text-gray-500">
            💡 Tip: Right-click để sửa | Click X để xóa (chỉ xóa được khi không
            có sản phẩm)
          </p>
        )}

        {/* ✅ Helper text - STAFF */}
        {isStaff && (
          <p className="mt-2 text-xs text-gray-500">
            💡 Bạn chỉ có quyền cập nhật số lượng kho (+ / -)
          </p>
        )}
      </div>

      {/* Bộ lọc */}
      <ProductsFilters
        q={q}
        setQ={setQ}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        setPage={setPage}
      />

      {/* ✅ Bảng - Phân quyền actions */}
      <ProductsTable
        isLoading={isLoading}
        isError={isError}
        list={list}
        meta={meta}
        // ✅ Edit - CHỈ ADMIN
        onEdit={
          isAdmin
            ? (p) => {
                setEditingProduct(p);
                setOpenProductModal(true);
              }
            : undefined // Staff không có edit
        }
        // ✅ Delete - CHỈ ADMIN
        onDelete={
          isAdmin
            ? (id) => {
                if (confirm("Xoá sản phẩm này?")) deleteProductMut.mutate(id);
              }
            : undefined // Staff không có delete
        }
        // ✅ Stock +/- - CẢ ADMIN & STAFF
        onInc={(id) => stockMut.mutate({ id, diff: +1 })}
        onDec={(id) => stockMut.mutate({ id, diff: -1 })}
        canDelete={isAdmin} // Chỉ Admin mới thấy nút delete
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

      {/* ✅ MODAL: Product - CHỈ ADMIN */}
      {isAdmin && (
        <ProductModal
          open={openProductModal}
          onClose={() => {
            setOpenProductModal(false);
            setEditingProduct(null);
          }}
          initial={editingProduct}
          onSave={(payload) =>
            upsertProductMut.mutate(payload, {
              onSuccess: () => {
                setOpenProductModal(false);
                setEditingProduct(null);
              },
            })
          }
          canEditAll={isAdmin}
        />
      )}

      {/* ✅ MODAL: Category - CHỈ ADMIN */}
      {isAdmin && (
        <CategoryModal
          open={openCategoryModal}
          onClose={() => {
            setOpenCategoryModal(false);
            setEditingCategory(null);
          }}
          initial={editingCategory}
          onSave={handleSaveCategory}
          canEditAll={isAdmin}
        />
      )}
    </div>
  );
}
