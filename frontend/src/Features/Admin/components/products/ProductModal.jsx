// src/Features/Admin/components/products/ProductModal.jsx
import { useEffect, useState } from "react";
import { useSignCloudinary } from "../../hooks/useProducts";
import { useCategories } from "../../../../hooks/useCategories"; // ✅ NEW: Fetch từ API
import DynamicSpecsFields from "./DynamicSpecsFields";
import { CircleX } from "lucide-react";

export default function ProductModal({
  open,
  onClose,
  initial,
  onSave,
  canEditAll,
}) {
  const [uploading, setUploading] = useState(false);
  const signMut = useSignCloudinary();

  // ✅ Fetch categories từ API thay vì hardcoded
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [form, setForm] = useState({
    id: undefined,
    title: "",
    slug: "",
    category: "",
    brand: "",
    price: 0,
    stock: 0,
    image: "",
    images: [],
    description: "",
    active: true,
    isFeatured: false,
    specs: {},
  });

  useEffect(() => {
    if (!initial) {
      // Reset form khi không có initial data
      setForm({
        id: undefined,
        title: "",
        slug: "",
        category: "",
        brand: "",
        price: 0,
        stock: 0,
        image: "",
        images: [],
        description: "",
        active: true,
        isFeatured: false,
        specs: {},
      });
      return;
    }

    setForm({
      id: initial.id,
      title: initial.title || "",
      slug: initial.slug || "",
      category: initial.category || "",
      brand: initial.brand || "",
      price: initial.price ?? 0,
      stock: initial.stock ?? 0,
      image:
        Array.isArray(initial.images) && initial.images.length
          ? initial.images[0]
          : initial.image || "",
      images: Array.isArray(initial.images) ? initial.images : [],
      description: initial.description || "",
      active:
        typeof initial.active === "boolean"
          ? initial.active
          : (initial.status || "active") === "active",
      isFeatured: !!initial.isFeatured,
      specs: initial.specs || {},
    });
  }, [initial, open]);

  if (!open) return null;

  const save = (e) => {
    e.preventDefault();

    // Validation
    if (!form.title?.trim()) {
      alert("⚠️ Vui lòng nhập Tên sản phẩm.");
      return;
    }
    if (!form.category?.trim()) {
      alert("⚠️ Vui lòng chọn Danh mục sản phẩm.");
      return;
    }

    const payload = {
      id: form.id,
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      description: form.description?.trim() || "",
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,

      // ✅ Đảm bảo images là array
      images:
        Array.isArray(form.images) && form.images.length > 0
          ? form.images
          : form.image
          ? [form.image]
          : [],

      category: form.category?.trim() || "",
      brand: form.brand?.trim() || "",

      // ✅ active sẽ được API chuyển thành status
      active: Boolean(form.active),
      isFeatured: Boolean(form.isFeatured),

      // ✅ Đảm bảo specs là object
      specs: form.specs && typeof form.specs === "object" ? form.specs : {},
    };

    console.log("📤 Payload từ form:", payload);

    onSave(payload);
  };

  // Upload file → Cloudinary (ký bởi server)
  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await signMut.mutateAsync();
      const { timestamp, signature, apiKey, cloudName, folder } = data || {};

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      if (folder) formData.append("folder", folder);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const res = await fetch(endpoint, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload thất bại");
      const json = await res.json();

      const url = json.secure_url;
      setForm((f) => ({
        ...f,
        image: url,
        images: Array.from(new Set([...(f.images || []), url])),
      }));
    } catch (e) {
      alert(e.message || "Không upload được ảnh.");
    } finally {
      setUploading(false);
    }
  };

  // Xóa ảnh khỏi danh sách
  const removeImage = (urlToRemove) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((url) => url !== urlToRemove),
      image: f.image === urlToRemove ? f.images[0] || "" : f.image,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 overflow-y-auto p-4">
      <form
        onSubmit={save}
        className="w-full max-w-4xl rounded-xl bg-white p-6 space-y-5 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {form.id ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
          >
            <CircleX />
          </button>
        </div>

        {/* Section 1: Thông tin cơ bản */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">📝</span>
            Thông tin cơ bản
          </h4>

          {/* ✅ Category (fetch từ API) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value,
                  specs: {}, // Reset specs khi đổi category
                }))
              }
              disabled={!canEditAll || categoriesLoading}
              required
            >
              <option value="">
                {categoriesLoading
                  ? "Đang tải danh mục..."
                  : "-- Chọn danh mục --"}
              </option>
              {/* ✅ Map từ API */}
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <p className="mt-1 text-xs text-gray-500">
                ⏳ Đang tải danh mục từ server...
              </p>
            )}
          </div>

          {/* Tên & Slug */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="VD: PC Intel i3-12100F/ VGA RX 6500XT"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                disabled={!canEditAll}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL thân thiện)
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="Để trống để tự động tạo"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                disabled={!canEditAll}
              />
            </div>
          </div>

          {/* Brand, Price, Stock */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thương hiệu
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="ASUS, MSI, Gigabyte..."
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
                disabled={!canEditAll}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="0"
                value={form.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]*$/.test(value)) {
                    setForm((f) => ({ ...f, price: value }));
                  }
                }}
                onFocus={(e) => {
                  if (Number(e.target.value) === 0) {
                    setForm((f) => ({ ...f, price: "" }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setForm((f) => ({ ...f, price: 0 }));
                  } else {
                    setForm((f) => ({ ...f, price: Number(e.target.value) }));
                  }
                }}
                disabled={!canEditAll}
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="0"
                value={form.stock}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]*$/.test(value)) {
                    setForm((f) => ({ ...f, stock: value }));
                  }
                }}
                onFocus={(e) => {
                  if (Number(e.target.value) === 0) {
                    setForm((f) => ({ ...f, stock: "" }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setForm((f) => ({ ...f, stock: 0 }));
                  } else {
                    setForm((f) => ({ ...f, stock: Number(e.target.value) }));
                  }
                }}
                min="0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              rows={3}
              placeholder="Mô tả chi tiết về sản phẩm..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              disabled={!canEditAll}
            />
          </div>
        </div>

        {/* Section 2: Hình ảnh */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🖼️</span>
            Hình ảnh sản phẩm
          </h4>

          <div className="grid md:grid-cols-2 gap-3">
            {/* URL ảnh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL hình ảnh
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="https://..."
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
                disabled={!canEditAll}
              />
            </div>

            {/* Upload Cloudinary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hoặc tải ảnh lên
              </label>
              <label
                className={`flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-3 py-2 cursor-pointer hover:border-blue-400 transition ${
                  uploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  disabled={uploading || !canEditAll}
                />
                <span className="text-sm text-gray-600">
                  {uploading ? "⏳ Đang tải lên..." : "📤 Chọn file từ máy"}
                </span>
              </label>
            </div>
          </div>

          {/* Preview ảnh */}
          {!!form.images?.length && (
            <div className="flex gap-2 flex-wrap p-3 bg-gray-50 rounded-lg">
              {form.images.map((url, idx) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt={`preview-${idx}`}
                    className="w-20 h-20 rounded object-cover border-2 border-gray-200"
                  />
                  {canEditAll && (
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                      title="Xóa ảnh này"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Thông số kỹ thuật (Dynamic) */}
        <div className="space-y-3 border-t pt-4">
          <DynamicSpecsFields
            category={form.category}
            specs={form.specs}
            onChange={(specs) => setForm((f) => ({ ...f, specs }))}
            disabled={!canEditAll}
          />
        </div>

        {/* Section 4: Options */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                disabled={!canEditAll}
                className="w-4 h-4"
              />
              <span>✅ Hiển thị bán (Active)</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm ml-4">
              <input
                type="checkbox"
                checked={!!form.isFeatured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                }
                disabled={!canEditAll}
                className="w-4 h-4"
              />
              <span>⭐ Sản phẩm nổi bật</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
              disabled={uploading || categoriesLoading}
            >
              {uploading ? "⏳ Đang xử lý..." : "💾 Lưu sản phẩm"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
