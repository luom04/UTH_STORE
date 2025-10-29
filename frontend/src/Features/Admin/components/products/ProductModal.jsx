// src/Features/Admin/components/products/ProductModal.jsx
import { useEffect, useState } from "react";
import { useSignCloudinary } from "../../hooks/useProducts";

export default function ProductModal({
  open,
  onClose,
  initial,
  onSave,
  canEditAll,
}) {
  const [uploading, setUploading] = useState(false);
  const signMut = useSignCloudinary();

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
    if (!initial) return;
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
  }, [initial]);

  if (!open) return null;

  const save = (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      alert("Vui lòng nhập Tên sản phẩm.");
      return;
    }
    const payload = {
      id: form.id,
      title: form.title,
      slug: form.slug || undefined,
      description: form.description || "",
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      images: form.images?.length
        ? form.images
        : form.image
        ? [form.image]
        : [],
      category: form.category || "",
      brand: form.brand || "",
      active: !!form.active,
      isFeatured: !!form.isFeatured,
      specs: form.specs || undefined,
    };
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
      const json = await res.json(); // { secure_url, public_id, ... }

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

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form
        onSubmit={save}
        className="w-full max-w-2xl rounded-xl bg-white p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold">
          {form.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </h3>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Tên sản phẩm"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            disabled={!canEditAll}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Slug (tuỳ chọn)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            disabled={!canEditAll}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Danh mục"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            disabled={!canEditAll}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Thương hiệu"
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            disabled={!canEditAll}
          />
          <input
            type="number"
            className="rounded-lg border px-3 py-2"
            placeholder="Giá (đ)"
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))
            }
            disabled={!canEditAll}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="number"
            className="rounded-lg border px-3 py-2"
            placeholder="Tồn kho"
            value={form.stock}
            onChange={(e) =>
              setForm((f) => ({ ...f, stock: Number(e.target.value) || 0 }))
            }
          />

          {/* URL ảnh (giữ lại) */}
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Ảnh (URL)"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            disabled={!canEditAll}
          />

          {/* Upload file lên Cloudinary */}
          <div className="flex items-center gap-2">
            <label
              className={`flex-1 rounded-lg border px-3 py-2 cursor-pointer text-sm ${
                uploading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={uploading}
              />
              {uploading ? "Đang upload…" : "Tải ảnh lên Cloudinary"}
            </label>
          </div>
        </div>

        {/* preview ảnh nhỏ */}
        {!!form.images?.length && (
          <div className="flex gap-2 flex-wrap">
            {form.images.map((u) => (
              <img
                key={u}
                src={u}
                alt="preview"
                className="w-16 h-16 rounded object-cover border"
              />
            ))}
          </div>
        )}

        <textarea
          className="w-full rounded-lg border px-3 py-2"
          rows={4}
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          disabled={!canEditAll}
        />

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              disabled={!canEditAll}
            />
            Hiển thị bán (status = active)
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              disabled={uploading}
            >
              Lưu
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
