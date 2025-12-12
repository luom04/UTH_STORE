// src/Features/Admin/components/products/ProductModal.jsx
import { useEffect, useRef, useState } from "react";
import { useUploadToCloudinary } from "../../../../hooks/useUploads";
import { useCategories } from "../../../../hooks/useCategories";
import { useAdminProducts } from "../../../../hooks/useProducts"; // ✅ dùng để search product quà tặng
import DynamicSpecsFields from "./DynamicSpecsFields";
import { CircleX, Upload, Gift, Tag, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductModal({
  open,
  onClose,
  initial,
  onSave,
  canEditAll,
}) {
  const uploadMut = useUploadToCloudinary();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingThumbs, setUploadingThumbs] = useState(false);

  const [mainUrlInput, setMainUrlInput] = useState("");
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [mainPreviewUrl, setMainPreviewUrl] = useState("");
  const [editingStudentDiscount, setEditingStudentDiscount] = useState(false);

  // Input tạm cho gift (text)
  const [giftInput, setGiftInput] = useState("");

  // ✅ Search UI cho giftProducts (không nhập ID thủ công)
  const [giftSearchInput, setGiftSearchInput] = useState("");
  const [giftSearch, setGiftSearch] = useState("");
  const [showGiftDropdown, setShowGiftDropdown] = useState(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setGiftSearch(giftSearchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [giftSearchInput]);

  const giftParams = {
    page: 1,
    limit: 8,
    q: giftSearch,
    fields: "title,images,price,priceSale,stock",
  };

  const { data: giftRes, isLoading: giftLoading } =
    useAdminProducts(giftParams);

  // API admin trả về { success, data, meta }
  const giftCandidates =
    giftRes?.data || giftRes?.products || giftRes?.items || [];

  const mainFileRef = useRef(null);
  const thumbsFileRef = useRef(null);

  const [form, setForm] = useState({
    id: undefined,
    title: "",
    slug: "",
    category: "",
    brand: "",
    price: 0,
    discountPercent: 0,
    priceSale: 0,
    stock: 0,
    image: "",
    images: [],
    thumbnails: [],
    description: "",
    isFeatured: false,
    specs: {},

    // ✅ NEW FIELDS
    gifts: [],

    // ✅ quà tặng là sản phẩm trong kho
    // Lưu thêm title/image để hiển thị đẹp trong UI
    giftProducts: [],

    promotionText: "",
    studentDiscountAmount: 0,
  });

  const readOnly = !canEditAll;

  // Helper rounding
  const ceilTo10k = (n) => Math.ceil((Number(n) || 0) / 10000) * 10000;

  // Auto calculate Price from Sale Price
  useEffect(() => {
    const sale = Number(form.priceSale) || 0;
    let d = Number(form.discountPercent) || 0;
    if (d < 0) d = 0;
    if (d > 99) d = 99;

    let roundedBase = 0;
    if (sale > 0) {
      const denominator = 1 - d / 100;
      const computedBase = denominator <= 0 ? sale : sale / denominator;
      roundedBase = ceilTo10k(computedBase);
    }

    setForm((prev) => {
      if (prev.price === roundedBase) return prev;
      return { ...prev, price: roundedBase };
    });
  }, [form.priceSale, form.discountPercent]);

  // Init Form Data
  useEffect(() => {
    if (!initial) {
      setForm({
        id: undefined,
        title: "",
        slug: "",
        category: "",
        brand: "",
        price: 0,
        discountPercent: 0,
        priceSale: 0,
        stock: 0,
        image: "",
        images: [],
        thumbnails: [],
        description: "",
        isFeatured: false,
        specs: {},
        gifts: [],
        giftProducts: [],
        promotionText: "",
        studentDiscountAmount: 0,
      });
      setMainUrlInput("");
      setThumbnailUrlInput("");
      setMainPreviewUrl("");
      setGiftSearchInput("");
      setGiftSearch("");
      setShowGiftDropdown(false);
      return;
    }

    const firstImage =
      Array.isArray(initial.images) && initial.images.length
        ? initial.images[0]
        : initial.image || "";

    setForm({
      id: initial.id || initial._id,
      title: initial.title || "",
      slug: initial.slug || "",
      category: initial.category || "",
      brand: initial.brand || "",
      price: Number(initial.price) || 0,
      discountPercent: initial.discountPercent || 0,
      priceSale: Number(initial.priceSale) || 0,
      stock: initial.stock ?? 0,
      image: firstImage,
      images: Array.isArray(initial.images)
        ? initial.images
        : firstImage
        ? [firstImage]
        : [],
      thumbnails: Array.isArray(initial.thumbnails) ? initial.thumbnails : [],
      description: initial.description || "",
      isFeatured: !!initial.isFeatured,
      specs: initial.specs || {},

      gifts: Array.isArray(initial.gifts) ? initial.gifts : [],
      giftProducts: Array.isArray(initial.giftProducts)
        ? initial.giftProducts.map((gp) => ({
            product: gp.product?._id || gp.product,
            qty: Number(gp.qty || 1), // vẫn giữ default =1
            title: gp.product?.title,
            image: gp.product?.images?.[0],
          }))
        : [],
      promotionText: initial.promotionText || "",
      studentDiscountAmount: Number(initial.studentDiscountAmount) || 0,
    });

    setMainUrlInput("");
    setThumbnailUrlInput("");
    setMainPreviewUrl(firstImage || "");
    setGiftSearchInput("");
    setGiftSearch("");
    setShowGiftDropdown(false);
  }, [initial, open]);

  if (!open) return null;

  // Save Handler
  const save = (e) => {
    e.preventDefault();
    if (!canEditAll) return; // an toàn, staff không được submit

    if (!form.title?.trim()) return alert("⚠️ Vui lòng nhập Tên sản phẩm.");
    if (!form.category?.trim()) return alert("⚠️ Vui lòng chọn Danh mục.");

    const payload = {
      id: form.id,
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      description: form.description?.trim() || "",
      price: Number(form.price) || 0,
      discountPercent: Number(form.discountPercent) || 0,
      priceSale: Number(form.priceSale) || 0,
      stock: Number(form.stock) || 0,
      images:
        Array.isArray(form.images) && form.images.length > 0
          ? form.images
          : form.image
          ? [form.image]
          : [],
      thumbnails: Array.isArray(form.thumbnails) ? form.thumbnails : [],
      category: form.category?.trim() || "",
      brand: form.brand?.trim() || "",
      active: true,
      isFeatured: Boolean(form.isFeatured),
      specs: form.specs && typeof form.specs === "object" ? form.specs : {},

      gifts: form.gifts,
      // ✅ gửi xuống BE: chỉ cần product + qty=1
      giftProducts: (form.giftProducts || []).map((gp) => ({
        product: gp.product,
        qty: 1,
      })),
      promotionText: form.promotionText?.trim() || "",
      studentDiscountAmount: Number(form.studentDiscountAmount) || 0,
    };

    onSave && onSave(payload);
  };

  // Image handlers
  const addMainUrl = () => {
    if (readOnly) return;
    const url = mainUrlInput.trim();
    if (!url) return;
    setForm((f) => ({
      ...f,
      image: url,
      images: Array.from(new Set([url, ...(f.images || [])])),
    }));
    setMainPreviewUrl(url);
    setMainUrlInput("");
  };

  const handleMainFile = async (file) => {
    if (readOnly) return;
    if (!file) return;
    setUploadingMain(true);
    const tid = toast.loading("Đang upload ảnh chính...");
    const localUrl = URL.createObjectURL(file);
    setMainPreviewUrl(localUrl);
    try {
      const folder = form.category ? `products/${form.category}` : "products";
      const { url } = await uploadMut.mutateAsync({
        file,
        folder,
        resourceType: "image",
      });
      setForm((f) => ({
        ...f,
        image: url,
        images: Array.from(new Set([url, ...(f.images || [])])),
      }));
      setMainPreviewUrl(url);
      toast.success("Upload thành công!", { id: tid });
    } catch (e) {
      toast.error("Upload thất bại.", { id: tid });
    } finally {
      setUploadingMain(false);
      URL.revokeObjectURL(localUrl);
      if (mainFileRef.current) mainFileRef.current.value = "";
    }
  };

  const addThumbnailUrl = () => {
    if (readOnly) return;
    const url = thumbnailUrlInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, thumbnails: [...(f.thumbnails || []), url] }));
    setThumbnailUrlInput("");
  };

  const handleThumbsFiles = async (files) => {
    if (readOnly) return;
    if (!files?.length) return;
    setUploadingThumbs(true);
    const tid = toast.loading("Đang upload thumbnails...");
    try {
      const folder = form.category ? `products/${form.category}` : "products";
      const uploaded = [];
      for (const file of files) {
        const { url } = await uploadMut.mutateAsync({
          file,
          folder,
          resourceType: "image",
        });
        uploaded.push(url);
      }
      setForm((f) => ({
        ...f,
        thumbnails: [...(f.thumbnails || []), ...uploaded],
      }));
      toast.success("Upload thành công!", { id: tid });
    } catch (e) {
      toast.error("Upload thất bại.", { id: tid });
    } finally {
      setUploadingThumbs(false);
      if (thumbsFileRef.current) thumbsFileRef.current.value = "";
    }
  };

  const removeImage = (urlToRemove, isThumb = false) => {
    if (readOnly) return;
    if (isThumb) {
      setForm((f) => ({
        ...f,
        thumbnails: (f.thumbnails || []).filter((url) => url !== urlToRemove),
      }));
    } else {
      setForm((f) => {
        const nextImages = (f.images || []).filter(
          (url) => url !== urlToRemove
        );
        const nextMain =
          f.image === urlToRemove ? nextImages[0] || "" : f.image;
        setMainPreviewUrl(nextMain || "");
        return { ...f, images: nextImages, image: nextMain };
      });
    }
  };

  // ✅ HANDLER CHO QUÀ TẶNG (TEXT)
  const addGift = () => {
    if (!canEditAll) return;
    const val = giftInput.trim();
    if (!val) return;
    if (form.gifts.includes(val)) return toast.error("Quà tặng này đã có");
    setForm((f) => ({ ...f, gifts: [...f.gifts, val] }));
    setGiftInput("");
  };

  const removeGift = (idx) => {
    if (!canEditAll) return;
    setForm((f) => ({ ...f, gifts: f.gifts.filter((_, i) => i !== idx) }));
  };

  // ✅ ADD GIFT PRODUCT BẰNG CLICK TỪ SEARCH
  const addGiftProductByProduct = (p) => {
    if (!canEditAll) return;
    const pid = p?._id || p?.id;
    if (!pid) return;

    if (form.giftProducts.some((gp) => String(gp.product) === String(pid))) {
      return toast.error("Sản phẩm quà tặng này đã có");
    }

    setForm((f) => ({
      ...f,
      giftProducts: [
        ...(f.giftProducts || []),
        {
          product: pid,
          qty: 1,
          title: p.title,
          image: p.images?.[0] || "",
        },
      ],
    }));

    setGiftSearchInput("");
    setGiftSearch("");
    setShowGiftDropdown(false);
  };

  const removeGiftProduct = (idx) => {
    if (!canEditAll) return;
    setForm((f) => ({
      ...f,
      giftProducts: f.giftProducts.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 overflow-y-auto p-4">
      <form
        onSubmit={save}
        className="w-full max-w-4xl rounded-xl bg-white p-6 space-y-5 my-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {readOnly
                ? "👁️ Xem chi tiết sản phẩm"
                : form.id
                ? "✏️ Sửa sản phẩm"
                : "➕ Thêm sản phẩm mới"}
            </h3>
            {readOnly && (
              <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-1 inline-block">
                Chế độ chỉ xem – bạn không có quyền chỉnh sửa sản phẩm này.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-red-600"
          >
            <CircleX />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">📝</span> Thông tin cơ bản
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value, specs: {} })
              }
              disabled={readOnly || categoriesLoading}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                disabled={readOnly}
                placeholder="Tự động tạo nếu để trống"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thương hiệu
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              disabled={readOnly}
              placeholder="ASUS, MSI..."
            />
          </div>

          {/* PRICING */}
          <div className="grid md:grid-cols-3 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2 font-bold text-blue-700"
                value={form.priceSale || ""}
                onChange={(e) =>
                  setForm({ ...form, priceSale: Number(e.target.value) })
                }
                min="0"
                required
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giảm giá (%)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2"
                value={form.discountPercent || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountPercent: Number(e.target.value),
                  })
                }
                min="0"
                max="99"
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá gốc (Tự tính)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-500"
                value={(Number(form.price) || 0).toLocaleString()}
                readOnly
                disabled
              />
            </div>
          </div>

          {/* ✅ PROMOTION & GIFTS BLOCK */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-4">
            <h4 className="font-bold text-red-700 flex items-center gap-2 text-sm uppercase">
              <Gift size={16} /> Quà tặng & Khuyến mãi
            </h4>

            {/* Promotion Text */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Text Khuyến mãi (Highlight)
              </label>
              <div className="flex gap-2">
                <div className="grid place-items-center w-8 h-8 bg-red-100 rounded text-red-500">
                  <Tag size={16} />
                </div>
                <input
                  className="flex-1 rounded-lg border px-3 py-1 text-sm"
                  placeholder="VD: Giảm thêm 500k khi là HSSV"
                  value={form.promotionText}
                  onChange={(e) =>
                    setForm({ ...form, promotionText: e.target.value })
                  }
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Student Discount Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Giảm cho sinh viên (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border px-3 py-2 text-sm font-medium"
                placeholder="0"
                value={
                  editingStudentDiscount
                    ? form.studentDiscountAmount === 0
                      ? ""
                      : form.studentDiscountAmount
                    : form.studentDiscountAmount
                }
                onFocus={() => !readOnly && setEditingStudentDiscount(true)}
                onBlur={(e) => {
                  setEditingStudentDiscount(false);
                  if (e.target.value === "") {
                    setForm((f) => ({ ...f, studentDiscountAmount: 0 }));
                  }
                }}
                onChange={(e) => {
                  if (readOnly) return;
                  const v = e.target.value;
                  if (v === "") {
                    setForm((f) => ({ ...f, studentDiscountAmount: 0 }));
                    return;
                  }
                  setForm((f) => ({
                    ...f,
                    studentDiscountAmount: Number(v),
                  }));
                }}
                disabled={readOnly}
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Số tiền này sẽ được trừ thêm khi tài khoản đã được xác thực sinh
                viên.
              </p>
            </div>

            {/* Gift List (TEXT) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Danh sách quà tặng kèm (text hiển thị)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                  placeholder="VD: Chuột Gaming Logitech G102..."
                  value={giftInput}
                  onChange={(e) => setGiftInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addGift())
                  }
                  disabled={readOnly}
                />
                <button
                  type="button"
                  onClick={addGift}
                  disabled={readOnly}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  Thêm
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.gifts.map((gift, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-red-200 rounded-full text-sm text-red-700 shadow-sm"
                  >
                    <span>🎁 {gift}</span>
                    <button
                      type="button"
                      onClick={() => removeGift(idx)}
                      disabled={readOnly}
                      className="text-red-400 hover:text-red-600 disabled:opacity-60"
                    >
                      <CircleX size={14} />
                    </button>
                  </div>
                ))}
                {form.gifts.length === 0 && (
                  <span className="text-xs text-gray-400 italic">
                    Chưa có quà tặng nào.
                  </span>
                )}
              </div>
            </div>

            {/* ✅ Gift Products (trừ stock thật) - SEARCH SELECT */}
            <div className="pt-3 border-t border-red-200">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Quà tặng là sản phẩm trong kho (trừ stock thật)
              </label>

              <div className="relative">
                <div className="flex items-center gap-2 border rounded-lg bg-white px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    className="flex-1 text-sm outline-none"
                    placeholder="Tìm sản phẩm quà tặng theo tên..."
                    value={giftSearchInput}
                    onChange={(e) => setGiftSearchInput(e.target.value)}
                    onFocus={() => !readOnly && setShowGiftDropdown(true)}
                    disabled={readOnly}
                  />
                </div>

                {/* Dropdown list */}
                {showGiftDropdown && !readOnly && (
                  <div
                    className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-64 overflow-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {giftLoading && (
                      <div className="p-3 text-sm text-gray-500">
                        Đang tìm sản phẩm...
                      </div>
                    )}

                    {!giftLoading && giftCandidates.length === 0 && (
                      <div className="p-3 text-sm text-gray-500">
                        Không tìm thấy sản phẩm phù hợp.
                      </div>
                    )}

                    {!giftLoading &&
                      giftCandidates.map((p) => {
                        const pid = p._id || p.id;
                        const existed = form.giftProducts.some(
                          (gp) => String(gp.product) === String(pid)
                        );
                        return (
                          <button
                            key={pid}
                            type="button"
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 ${
                              existed ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() =>
                              !existed && addGiftProductByProduct(p)
                            }
                            disabled={existed}
                          >
                            <img
                              src={p.images?.[0] || ""}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded bg-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium line-clamp-1">
                                {p.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                Tồn kho: {p.stock ?? 0}
                              </div>
                            </div>
                            <div className="text-xs text-red-600 font-semibold">
                              {(p.priceSale || p.price || 0).toLocaleString()}đ
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* List giftProducts đã chọn */}
              <div className="mt-2 space-y-1">
                {form.giftProducts?.map((gp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm bg-white border border-red-200 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {gp.image ? (
                        <img
                          src={gp.image}
                          alt={gp.title || gp.product}
                          className="w-8 h-8 rounded object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100" />
                      )}

                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 line-clamp-1">
                          🎁 {gp.title || `ID: ${gp.product}`}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          (Tặng 1 / mỗi sản phẩm mua)
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGiftProduct(idx)}
                      disabled={readOnly}
                      className="text-red-400 hover:text-red-600 disabled:opacity-60"
                    >
                      <CircleX size={16} />
                    </button>
                  </div>
                ))}

                {(!form.giftProducts || form.giftProducts.length === 0) && (
                  <span className="text-xs text-gray-400 italic">
                    Chưa có quà tặng sản phẩm nào.
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-500 mt-1">
                Admin chỉ cần tìm và chọn sản phẩm. Hệ thống tự lưu ID để trừ
                stock quà tặng khi khách đặt hàng.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2"
                value={form.stock || ""}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
                min="0"
                required
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2"
                rows={1}
                placeholder="Mô tả ngắn..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Images Block */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🖼️</span> Ảnh sản phẩm
          </h4>

          {/* Main Image */}
          <div className="flex gap-2 items-start">
            <div className="w-24 h-24 border rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {mainPreviewUrl ? (
                <img
                  src={mainPreviewUrl}
                  className="w-full h-full object-cover"
                  alt="Main"
                />
              ) : (
                <span className="text-xs text-gray-400">No Image</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  placeholder="URL ảnh chính..."
                  value={mainUrlInput}
                  onChange={(e) => setMainUrlInput(e.target.value)}
                  disabled={readOnly}
                />
                <button
                  type="button"
                  onClick={addMainUrl}
                  disabled={readOnly}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60"
                >
                  Add URL
                </button>
              </div>
              <label
                className={`flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                  uploadingMain ? "opacity-50" : ""
                } ${readOnly ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={mainFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleMainFile(e.target.files[0])}
                  disabled={uploadingMain || readOnly}
                />
                <Upload size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {uploadingMain ? "Uploading..." : "Upload từ máy"}
                </span>
              </label>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnails (Gallery)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                placeholder="URL thumbnail..."
                value={thumbnailUrlInput}
                onChange={(e) => setThumbnailUrlInput(e.target.value)}
                disabled={readOnly}
              />
              <button
                type="button"
                onClick={addThumbnailUrl}
                disabled={readOnly}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60"
              >
                Add URL
              </button>
              <label
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer ${
                  uploadingThumbs ? "opacity-50" : ""
                } ${readOnly ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={thumbsFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) =>
                    handleThumbsFiles(Array.from(e.target.files))
                  }
                  disabled={uploadingThumbs || readOnly}
                />
                <Upload size={16} />
                <span className="text-sm">Upload Nhiều</span>
              </label>
            </div>

            {/* List Thumbs */}
            <div className="flex flex-wrap gap-2">
              {form.thumbnails.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 border rounded overflow-hidden group"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover"
                    alt="Thumb"
                  />
                  {canEditAll && (
                    <button
                      type="button"
                      onClick={() => removeImage(url, true)}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <CircleX size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="space-y-3 border-t pt-4">
          <DynamicSpecsFields
            category={form.category}
            specs={form.specs}
            onChange={(specs) => setForm((f) => ({ ...f, specs }))}
            disabled={readOnly}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-red-600 rounded"
              checked={!!form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
              disabled={readOnly}
            />
            <span className="text-sm font-medium text-gray-700">
              Sản phẩm nổi bật (Hot)
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border hover:bg-gray-50"
            >
              {readOnly ? "Đóng" : "Hủy"}
            </button>
            {/* ✅ Nút Lưu chỉ cho Admin / canEditAll */}
            {canEditAll && (
              <button
                type="submit"
                disabled={uploadingMain || uploadingThumbs}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg disabled:opacity-50"
              >
                {uploadingMain || uploadingThumbs
                  ? "Đang xử lý..."
                  : "Lưu Sản Phẩm"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
