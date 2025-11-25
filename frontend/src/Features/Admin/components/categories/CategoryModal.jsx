// src/Features/Admin/components/categories/CategoryModal.jsx
import { useEffect, useState } from "react";
import { CircleX, Upload, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUploadToCloudinary } from "../../../../hooks/useUploads";

// ==========================================================
// 1. COMPONENT PREVIEW DÙNG CHUNG
// Đặt bên ngoài component chính để tránh re-render không cần thiết
// ==========================================================
function ImagePreview({
  src,
  onDelete,
  onError,
  placeholder,
  label,
  deleteTitle,
  aspectClass = "aspect-[16/9]", // Mặc định là banner
  objectClass = "object-cover", // Mặc định là banner
  widthClass = "w-full", // Mặc định là banner
}) {
  return (
    <div className="max-w-xs p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 mx-auto">
      <div className="relative group">
        <div
          className={`rounded border-2 border-indigo-200 overflow-hidden bg-white grid place-items-center mx-auto ${widthClass} ${aspectClass}`}
        >
          {src ? (
            <img
              src={src}
              alt={placeholder}
              className={`w-full h-full ${objectClass}`}
              loading="lazy"
              onError={onError}
            />
          ) : (
            <span className="text-xs text-gray-400">{placeholder}</span>
          )}
        </div>
        {src && (
          <>
            <span className="absolute left-1 bottom-1 text-[11px] px-2 py-[2px] rounded bg-indigo-600 text-white shadow-sm">
              {label}
            </span>
            <button
              type="button"
              onClick={onDelete}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow"
              title={deleteTitle}
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// 2. COMPONENT MODAL CHÍNH
// ==========================================================
export default function CategoryModal({
  open,
  onClose,
  initial,
  onSave,
  canEditAll,
}) {
  const uploadMut = useUploadToCloudinary();

  // State
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    slug: "",
    description: "",
    order: 0,
    status: "active",
    icon: "",
    imageUrl: "",
    bannerUrl: "",
  });
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [bannerUrlInput, setBannerUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Effect để load data khi edit
  useEffect(() => {
    if (!initial) {
      setForm({
        id: undefined,
        name: "",
        slug: "",
        description: "",
        order: 0,
        status: "active",
        icon: "",
        imageUrl: "",
        bannerUrl: "",
      });
      setImageUrlInput("");
      setBannerUrlInput("");
      return;
    }
    setForm({
      id: initial._id,
      name: initial.name || "",
      slug: initial.slug || "",
      description: initial.description || "",
      order: initial.order ?? 0,
      status: initial.status || "active",
      icon: initial.icon || "",
      imageUrl: initial.image || initial.imageUrl || initial.image?.url || "",
      bannerUrl: initial.banner || "",
    });
    setImageUrlInput("");
    setBannerUrlInput("");
  }, [initial, open]);

  if (!open) return null;

  // Handlers
  async function handleUploadImageFile(file) {
    if (!file || !canEditAll) return;
    setIsUploadingImage(true);
    const tId = toast.loading("Đang upload ảnh...");
    try {
      const { url } = await uploadMut.mutateAsync({
        file,
        folder: "categories",
        resourceType: "image",
      });
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Upload ảnh thành công!", { id: tId });
    } catch (e) {
      toast.error(e?.message || "Không thể upload ảnh, vui lòng thử lại.", {
        id: tId,
      });
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleUploadBannerFile(file) {
    if (!file || !canEditAll) return;
    setIsUploadingBanner(true);
    const tId = toast.loading("Đang upload banner...");
    try {
      const { url } = await uploadMut.mutateAsync({
        file,
        folder: "categories_banners",
        resourceType: "image",
      });
      setForm((f) => ({ ...f, bannerUrl: url }));
      toast.success("Upload banner thành công!", { id: tId });
    } catch (e) {
      toast.error(e?.message || "Không thể upload banner, vui lòng thử lại.", {
        id: tId,
      });
    } finally {
      setIsUploadingBanner(false);
    }
  }

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error("URL không hợp lệ");
      return;
    }
    setForm((f) => ({ ...f, imageUrl: url }));
    setImageUrlInput("");
    toast.success("Đã thêm ảnh từ URL");
  };

  const addBannerUrl = () => {
    const url = bannerUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error("URL banner không hợp lệ");
      return;
    }
    setForm((f) => ({ ...f, bannerUrl: url }));
    setBannerUrlInput("");
    toast.success("Đã thêm banner từ URL");
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }
    if (isUploadingImage || isUploadingBanner || uploadMut.isPending) {
      toast("Ảnh/Banner đang upload, vui lòng đợi xong rồi lưu.");
      return;
    }
    const payload = {
      id: form.id,
      name: form.name.trim(),
      slug: form.slug?.trim() || undefined,
      description: form.description?.trim() || "",
      order: Number(form.order) || 0,
      status: form.status,
      icon: form.icon?.trim() || "",
      image: form.imageUrl?.trim() || "",
      banner: form.bannerUrl?.trim() || "",
    };
    onSave(payload);
  };

  // Handlers cho Preview
  const handleImageError = () => {
    setForm((f) => ({ ...f, imageUrl: "" }));
    toast.error("Không tải được ảnh. Vui lòng thử URL khác.");
  };

  const handleBannerError = () => {
    setForm((f) => ({ ...f, bannerUrl: "" }));
    toast.error("Không tải được banner. Vui lòng thử URL khác.");
  };

  const isUploading =
    isUploadingImage || isUploadingBanner || uploadMut.isPending;

  // JSX
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
            aria-label="Đóng"
            title="Đóng"
          >
            <CircleX />
          </button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">📝</span>
            Thông tin cơ bản
          </h4>
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
          </div>
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

        {/* ẢNH DANH MỤC */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🖼️</span>
            Ảnh danh mục (Icon nhỏ)
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                disabled={!canEditAll}
              />
              <button
                type="button"
                onClick={addImageUrl}
                disabled={!imageUrlInput.trim() || !canEditAll}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Thêm ảnh từ URL"
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>
            <label
              className={`flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-3 py-2 cursor-pointer hover:border-indigo-400 bg-indigo-50 transition ${
                isUploadingImage ? "opacity-60 pointer-events-none" : ""
              }`}
              title="Chọn file từ máy"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) await handleUploadImageFile(file);
                  e.target.value = "";
                }}
                disabled={!canEditAll || isUploadingImage}
              />
              <Upload size={16} />
              <span className="text-sm font-medium text-gray-700">
                {isUploadingImage ? "⏳ Đang tải lên..." : "Chọn file từ máy"}
              </span>
            </label>
          </div>

          <ImagePreview
            src={form.imageUrl}
            onDelete={() => setForm((f) => ({ ...f, imageUrl: "" }))}
            onError={handleImageError}
            placeholder="Preview Ảnh"
            label="ẢNH"
            deleteTitle="Xóa ảnh này"
            aspectClass="aspect-square"
            objectClass="object-contain"
            widthClass="w-[120px]"
          />
        </div>

        {/* MỤC BANNER MỚI */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🏞️</span>
            Banner danh mục (Hiển thị ở đầu trang)
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="https://..."
                value={bannerUrlInput}
                onChange={(e) => setBannerUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBannerUrl();
                  }
                }}
                disabled={!canEditAll}
              />
              <button
                type="button"
                onClick={addBannerUrl}
                disabled={!bannerUrlInput.trim() || !canEditAll}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Thêm banner từ URL"
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>
            <label
              className={`flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-3 py-2 cursor-pointer hover:border-indigo-400 bg-indigo-50 transition ${
                isUploadingBanner ? "opacity-60 pointer-events-none" : ""
              }`}
              title="Chọn file từ máy"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) await handleUploadBannerFile(file);
                  e.target.value = "";
                }}
                disabled={!canEditAll || isUploadingBanner}
              />
              <Upload size={16} />
              <span className="text-sm font-medium text-gray-700">
                {isUploadingBanner ? "⏳ Đang tải lên..." : "Chọn file từ máy"}
              </span>
            </label>
          </div>

          <ImagePreview
            src={form.bannerUrl}
            onDelete={() => setForm((f) => ({ ...f, bannerUrl: "" }))}
            onError={handleBannerError}
            placeholder="Preview Banner"
            label="BANNER"
            deleteTitle="Xóa banner này"
          />
        </div>

        {/* Icon (lucide string) */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">✨</span>
            Icon (Lucide)
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Icon (lucide-react)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              placeholder='VD: "Laptop2", "Mouse", "PcCase" (có thể để trống)'
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              disabled={!canEditAll}
            />
            <p className="mt-1 text-xs text-gray-500">
              Nhập đúng tên component lucide (PascalCase). Ví dụ: Laptop2,
              Mouse, Cpu, PcCase…
            </p>
          </div>
        </div>

        {/* Cài đặt */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Cài đặt
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
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
                  if (e.target.value === "")
                    setForm((f) => ({ ...f, order: 0 }));
                  else
                    setForm((f) => ({ ...f, order: Number(e.target.value) }));
                }}
                disabled={!canEditAll}
                min="0"
              />
            </div>
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
                <option value="inactive">✗ Inactive (Ẩn)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
            disabled={isUploading}
          >
            {isUploading ? "Đang lưu..." : "💾 Lưu danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}
