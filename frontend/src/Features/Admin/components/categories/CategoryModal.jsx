// src/Features/Admin/components/categories/CategoryModal.jsx
import { useEffect, useState } from "react";
import { CircleX } from "lucide-react";

export default function CategoryModal({
  open,
  onClose,
  initial,
  onSave,
  canEditAll,
}) {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    slug: "",
    description: "",
    order: 0,
    status: "active",
  });

  useEffect(() => {
    if (!initial) {
      // Reset form
      setForm({
        id: undefined,
        name: "",
        slug: "",
        description: "",
        order: 0,
        status: "active",
      });
      return;
    }

    setForm({
      id: initial._id,
      name: initial.name || "",
      slug: initial.slug || "",
      description: initial.description || "",
      order: initial.order ?? 0,
      status: initial.status || "active",
    });
  }, [initial, open]);

  if (!open) return null;

  const save = (e) => {
    e.preventDefault();

    // Validation
    if (!form.name?.trim()) {
      alert("⚠️ Vui lòng nhập tên danh mục.");
      return;
    }

    const payload = {
      id: form.id,
      name: form.name.trim(),
      slug: form.slug?.trim() || undefined, // BE tự tạo nếu không có
      description: form.description?.trim() || "",
      order: Number(form.order) || 0,
      status: form.status,
    };

    console.log("📤 Category payload:", payload);
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 overflow-y-auto p-4">
      <form
        onSubmit={save}
        className="w-full max-w-2xl rounded-xl bg-white p-6 space-y-5 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {form.id ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"}
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

          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              placeholder="VD: Laptop, CPU, VGA..."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={!canEditAll}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL thân thiện)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              placeholder="Để trống để tự động tạo từ tên"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              disabled={!canEditAll}
            />
            <p className="mt-1 text-xs text-gray-500">
              VD: "laptop" → URL sẽ là /products?category=laptop
            </p>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              rows={3}
              placeholder="Mô tả ngắn gọn về danh mục..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              disabled={!canEditAll}
            />
          </div>
        </div>

        {/* Section 3: Cài đặt */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Cài đặt
          </h4>

          <div className="grid md:grid-cols-2 gap-3">
            {/* Thứ tự */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="0"
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: e.target.value }))
                }
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setForm((f) => ({ ...f, order: 0 }));
                  } else {
                    setForm((f) => ({ ...f, order: Number(e.target.value) }));
                  }
                }}
                disabled={!canEditAll}
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Số càng nhỏ càng hiển thị trước
              </p>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                disabled={!canEditAll}
              >
                <option value="active">✓ Active (Hiển thị)</option>
                <option value="inactive">○ Inactive (Ẩn)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition cursor-pointer"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
          >
            💾 Lưu danh mục
          </button>
        </div>
      </form>
    </div>
  );
}
