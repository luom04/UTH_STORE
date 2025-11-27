// src/Features/Admin/pages/BannerManager.jsx

import { useState, useMemo } from "react";
import { useAdminBanners, useBannerActions } from "../../../hooks/useBanners";
import { useUploadToCloudinary } from "../../../hooks/useUploads";

import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UploadCloud,
  LayoutTemplate,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// --- 1. COMPONENT: MỘT SLOT BANNER ---

function BannerSlot({ banner, type, index, onAdd, onEdit, onDelete }) {
  const typeLabelMap = {
    slider: "SLIDER",
    right: "RIGHT",
    bottom: "BOTTOM",
    "side-left": "SIDE LEFT",
    "side-right": "SIDE RIGHT",
  };

  const typeLabel = typeLabelMap[type] || type;
  if (!banner) {
    return (
      <div
        onClick={() => onAdd(type, index)}
        className="relative w-full h-full min-h-[160px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all group"
      >
        <Plus
          size={32}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-xs font-medium mt-2">Thêm Banner</span>
        <span className="text-[10px] opacity-60 uppercase">
          {type} #{index + 1}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[160px] rounded-xl overflow-hidden group shadow-sm border border-gray-100 bg-white">
      <img
        src={banner.image}
        alt="banner"
        className="w-full h-full object-cover"
      />

      {/* Overlay thao tác */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(banner);
          }}
          className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-sm"
          title="Sửa"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(banner._id || banner.id);
          }}
          className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform shadow-sm"
          title="Xóa"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Badge Info */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none truncate">
        {banner.title || "Banner không tiêu đề"}
        <span className="uppercase">{typeLabel}</span>
      </div>
    </div>
  );
}

// --- 2. COMPONENT: SLIDER EDITOR ---

function SliderEditor({ banners, onAdd, onEdit, onDelete }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000 }),
  ]);

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
      {banners.length > 0 ? (
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {banners.map((b) => (
              <div
                key={b._id || b.id}
                className="relative min-w-0 flex-[0_0_100%] h-full"
              >
                <img
                  src={b.image}
                  className="w-full h-full object-cover"
                  alt="slide"
                />

                {/* Nút Edit đè lên từng slide */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(b)}
                    className="px-4 py-2 bg-white rounded-lg text-sm font-medium shadow hover:bg-blue-50 text-blue-700"
                  >
                    <Pencil size={16} className="inline mr-1" /> Sửa Slide này
                  </button>
                  <button
                    onClick={() => onDelete(b._id || b.id)}
                    className="p-2 bg-white rounded-lg text-red-600 shadow hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Info Slide */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-md">
                  {b.title || "Slide không tiêu đề"} (Thứ tự: {b.order})
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
          <LayoutTemplate size={48} className="mb-2 opacity-20" />
          <p>Chưa có slider nào. Hãy thêm ảnh!</p>
        </div>
      )}

      <button
        onClick={() => onAdd("slider", banners.length)}
        className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg hover:bg-blue-700 flex items-center gap-1 z-20"
      >
        <Plus size={14} /> Thêm Slide Mới
      </button>
    </div>
  );
}

// --- 3. TRANG CHÍNH ---

export default function BannerManager() {
  const { data: banners, isLoading } = useAdminBanners();
  const { createMut, updateMut, deleteMut } = useBannerActions();
  const { mutateAsync: uploadFile, isPending: isUploading } =
    useUploadToCloudinary();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageTab, setImageTab] = useState("upload");

  // Form mặc định
  const initialForm = {
    title: "",
    subtitle: "",
    image: "",
    type: "slider",
    order: 0,
    isActive: true,

    // UI fields
    linkType: "category", // category | product
    linkTarget: "", // slug danh mục / sản phẩm
  };

  const [form, setForm] = useState(initialForm);

  const grouped = useMemo(() => {
    if (!banners) return { slider: [], right: [], bottom: [] };
    return {
      slider: banners
        .filter((b) => b.type === "slider")
        .sort((a, b) => a.order - b.order),
      right: banners
        .filter((b) => b.type === "right")
        .sort((a, b) => a.order - b.order),
      bottom: banners
        .filter((b) => b.type === "bottom")
        .sort((a, b) => a.order - b.order),
      sideLeft: banners
        .filter((b) => b.type === "side-left")
        .sort((a, b) => a.order - b.order),
      sideRight: banners
        .filter((b) => b.type === "side-right")
        .sort((a, b) => a.order - b.order),
    };
  }, [banners]);

  const handleAdd = (type, order) => {
    setEditingBanner(null);
    setForm({ ...initialForm, type, order });
    setImageTab("upload");
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    // Map linkType DB -> UI (chỉ hỗ trợ CATEGORY & PRODUCT)
    let uiLinkType = "category";
    switch (banner.linkType) {
      case "PRODUCT":
        uiLinkType = "product";
        break;
      case "CATEGORY":
        uiLinkType = "category";
        break;
      default:
        uiLinkType = "category";
    }

    setEditingBanner(banner);
    setForm({
      ...initialForm,
      ...banner,
      linkType: uiLinkType,
      linkTarget: banner.linkValue || "",
    });
    setImageTab("upload");
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa banner này không?"))
      deleteMut.mutate(id);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await uploadFile({ file, folder: "banners" });
      setForm((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error(error);
    }
  };

  /// ✅ Preview link cho admin (chỉ category & product)
  const buildLinkFromForm = (f) => {
    const target = (f.linkTarget || "").trim();

    if (!target) return "";

    if (f.linkType === "product") return `/products/${target}`;
    // default category
    return `/collections/${target}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.image) {
      return toast.error("Vui lòng chọn hoặc nhập link ảnh!");
    }

    const target = (form.linkTarget || "").trim();

    // Map UI linkType -> ENUM backend + linkValue
    let dbLinkType = "CATEGORY";
    let dbLinkValue = "";

    if (form.linkType === "category") {
      dbLinkType = "CATEGORY";
      dbLinkValue = target; // slug danh mục
    } else if (form.linkType === "product") {
      dbLinkType = "PRODUCT";
      dbLinkValue = target; // slug sản phẩm
    }

    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      image: form.image,
      type: form.type,
      order: form.order,
      isActive: form.isActive,

      linkType: dbLinkType,
      linkValue: dbLinkValue,
      // couponCode không dùng nữa => BE có field thì coi như optional
      couponCode: "",
    };

    if (editingBanner) {
      updateMut.mutate(
        { id: editingBanner._id || editingBanner.id, data: payload },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMut.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Giao diện Trang chủ
          </h1>
          <p className="text-sm text-gray-500">
            Nhấp vào các ô bên dưới để chỉnh sửa nội dung website.
          </p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        {/* GRID LAYOUT EDITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[420px]">
          <div className="lg:col-span-2 h-full min-h-[300px]">
            <SliderEditor
              banners={grouped.slider}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          <div className="flex flex-col gap-4 h-full min-h-[300px]">
            <div className="flex-1">
              <BannerSlot
                banner={grouped.right[0]}
                type="right"
                index={0}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
            <div className="flex-1">
              <BannerSlot
                banner={grouped.right[1]}
                type="right"
                index={1}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 h-auto md:h-[200px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[160px] md:h-full">
              <BannerSlot
                banner={grouped.bottom[i]}
                type="bottom"
                index={i}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Banner quảng cáo 2 bên (Sticky)
            </h2>
            <p className="text-xs text-gray-500">
              Mô phỏng 2 banner đứng ở hai bên trang (chỉ hiển thị trên màn hình
              lớn).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bên trái */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">
              Bên trái (side-left)
            </p>
            <div className="h-[200px]">
              <BannerSlot
                banner={grouped.sideLeft[0]}
                type="side-left"
                index={0}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>

          {/* Bên phải */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">
              Bên phải (side-right)
            </p>
            <div className="h-[200px]">
              <BannerSlot
                banner={grouped.sideRight[0]}
                type="side-right"
                index={0}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Vị trí:{" "}
                  <span className="font-medium text-blue-600 uppercase">
                    {form.type}
                  </span>{" "}
                  • Thứ tự: {form.order + 1}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id="banner-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* INPUT ẢNH */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Hình ảnh hiển thị <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-start gap-4">
                    <div className="w-28 h-20 rounded-lg border bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {form.image ? (
                        <img
                          src={form.image}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : (
                        <ImageIcon className="text-gray-300" size={32} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-3 w-fit">
                        <button
                          type="button"
                          onClick={() => setImageTab("upload")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            imageTab === "upload"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <UploadCloud size={14} className="inline mr-1" /> Tải
                          ảnh lên
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageTab("link")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            imageTab === "link"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <LinkIcon size={14} className="inline mr-1" /> Nhập
                          Link
                        </button>
                      </div>

                      {imageTab === "upload" ? (
                        <label
                          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors ${
                            isUploading ? "opacity-60 cursor-wait" : ""
                          }`}
                        >
                          {isUploading ? (
                            <Loader2
                              className="animate-spin text-blue-600"
                              size={18}
                            />
                          ) : (
                            <Plus className="text-gray-400" size={18} />
                          )}
                          <span className="text-sm text-gray-600">
                            {isUploading ? "Đang xử lý..." : "Chọn file từ máy"}
                          </span>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={isUploading}
                          />
                        </label>
                      ) : (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="https://example.com/image.jpg"
                          value={form.image}
                          onChange={(e) =>
                            setForm({ ...form, image: e.target.value })
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* INPUT TIÊU ĐỀ */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Tiêu đề lớn
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.title || ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="VD: LAPTOP GAMING"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Tiêu đề phụ
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.subtitle || ""}
                      onChange={(e) =>
                        setForm({ ...form, subtitle: e.target.value })
                      }
                      placeholder="VD: Giảm sốc 50%"
                    />
                  </div>
                </div>

                {/* CẤU HÌNH ĐIỀU HƯỚNG */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm mb-1">
                    <LinkIcon size={16} /> Cấu hình Điều Hướng
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold uppercase">
                        Loại link
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={form.linkType || "category"}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            linkType: e.target.value,
                            linkTarget: "",
                          })
                        }
                      >
                        <option value="category">Danh mục (Category)</option>
                        <option value="product">Sản phẩm (Product)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold uppercase">
                        Slug đích (Target)
                      </label>
                      <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder={
                          form.linkType === "category"
                            ? "VD: laptop-gaming"
                            : "VD: macbook-air-m2"
                        }
                        value={form.linkTarget || ""}
                        onChange={(e) =>
                          setForm({ ...form, linkTarget: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 pt-1 flex items-center gap-1">
                    Preview Link:{" "}
                    <span className="font-mono text-blue-600 font-medium bg-blue-100 px-1 rounded">
                      {buildLinkFromForm(form) || "(trống)"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    checked={!!form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                  >
                    Hiển thị banner này ngay lập tức
                  </label>
                </div>
              </form>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                form="banner-form"
                type="submit"
                disabled={!form.image || isUploading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-bold transition-colors shadow-md hover:shadow-lg"
              >
                {editingBanner ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
