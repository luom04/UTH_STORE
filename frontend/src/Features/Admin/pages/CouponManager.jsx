// src/Features/Admin/pages/CouponManager.jsx
import { useState, useEffect } from "react";
import { useAdminCoupons, useCouponActions } from "../../../hooks/useCoupons";
import { useAuth } from "../../../hooks/useAuth";
import {
  Plus,
  Trash2,
  Ticket,
  Ban,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

// ✅ Helper: Format ngày giờ chuẩn cho input (YYYY-MM-DDTHH:mm)
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 16);
};

// ✅ Helper: Format hiển thị đẹp cho người Việt (20/11/2025 14:30)
const formatDateDisplay = (dateString) => {
  if (!dateString) return "Vĩnh viễn";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ✅ Helper: label + màu cho Rank áp dụng
const RANK_LABELS = {
  MEMBER: "Tất cả (Member)",
  SILVER: "Silver trở lên",
  GOLD: "Gold trở lên",
  DIAMOND: "Chỉ Diamond",
};

const getRankBadgeClass = (rank) => {
  switch (rank) {
    case "DIAMOND":
      return "bg-cyan-100 text-cyan-800 border-cyan-300";
    case "GOLD":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "SILVER":
      return "bg-slate-200 text-slate-700 border-slate-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function CouponManager() {
  const { user } = useAuth();
  const isAdmin = String(user?.role).toLowerCase() === "admin";

  const { data: coupons, isLoading } = useAdminCoupons();
  const { createMut, deleteMut } = useCouponActions();

  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    couponId: null,
  });

  // Form State
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percent",
    value: 0,
    minOrderValue: 0,
    requiredRank: "MEMBER",
    usageLimit: 0,
    startDate: formatDateForInput(new Date()),
    endDate: "",
  });

  // ✅ Tính thời lượng (Duration) để hiển thị nhắc nhở
  const [durationText, setDurationText] = useState("");

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = end - start;
      if (diffTime < 0) {
        setDurationText("⚠️ Ngày kết thúc không hợp lệ (trước ngày bắt đầu)");
      } else {
        const diffDays = (diffTime / (1000 * 60 * 60 * 24)).toFixed(1);
        setDurationText(`⏱️ Thời hạn: ${diffDays} ngày`);
      }
    } else if (!form.endDate) {
      setDurationText("♾️ Hiệu lực vĩnh viễn");
    }
  }, [form.startDate, form.endDate]);

  // ✅ Hàm chọn nhanh thời gian (Presets)
  const applyPreset = (days) => {
    const start = new Date(form.startDate || new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + days); // Cộng thêm ngày
    // Set giờ kết thúc là 23:59 cho đẹp
    end.setHours(23, 59, 0, 0);

    setForm((prev) => ({
      ...prev,
      endDate: formatDateForInput(end),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.code || form.value <= 0)
      return toast.error("Vui lòng kiểm tra lại Mã và Giá trị");

    // Validate ngày tháng
    if (form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      return toast.error("Ngày kết thúc phải sau ngày bắt đầu");
    }

    // ================================
    // ✅ FIX TIMEZONE: convert sang ISO UTC trước khi gửi BE
    // ================================
    const payload = {
      ...form,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null, // null = vĩnh viễn
    };

    createMut.mutate(payload, {
      onSuccess: () => {
        setShowForm(false);
        setForm({
          code: "",
          description: "",
          discountType: "percent",
          value: 0,
          minOrderValue: 0,
          requiredRank: "MEMBER",
          usageLimit: 0,
          startDate: formatDateForInput(new Date()),
          endDate: "",
        });
      },
    });
  };

  if (isLoading)
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Quản lý Mã Giảm Giá
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-blue-700 transition shadow-sm items-center"
          >
            {showForm ? <Ban size={20} /> : <Plus size={20} />}
            {showForm ? "Đóng" : "Tạo Mã Mới"}
          </button>
        )}
      </div>

      {/* FORM TẠO MỚI */}
      {isAdmin && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in"
        >
          {/* Cột trái: Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
              <Ticket size={18} /> Thông tin mã
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Mã Code
              </label>
              <input
                className="w-full border p-2 rounded uppercase font-bold text-lg tracking-wider focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: SALE50"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Mô tả
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: Giảm 50k cho đơn từ 200k"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Loại giảm
                </label>
                <select
                  className="w-full border p-2 rounded bg-gray-50"
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: e.target.value })
                  }
                >
                  <option value="percent">Theo %</option>
                  <option value="amount">Tiền mặt</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Giá trị
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full border p-2 rounded font-bold text-blue-600 pr-8"
                    placeholder="0"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-400">
                    {form.discountType === "percent" ? "%" : "đ"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Điều kiện & Thời gian */}
          <div className="space-y-4">
            <div className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
              <Clock size={18} /> Giới hạn & Thời gian
            </div>

            {/* Chọn nhanh thời gian (Presets) */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <label className="text-xs font-bold text-blue-800 uppercase mb-2 block">
                Chọn nhanh thời hạn:
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyPreset(3)}
                  className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition"
                >
                  +3 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(7)}
                  className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition"
                >
                  +1 Tuần
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(30)}
                  className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition"
                >
                  +1 Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, endDate: "" })}
                  className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-600 hover:text-white transition"
                >
                  Vĩnh viễn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Bắt đầu
                </label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded text-sm"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Kết thúc
                </label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded text-sm"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Hiển thị thời lượng tính toán */}
            <div
              className={`text-sm font-medium text-center p-2 rounded ${
                durationText.includes("⚠️")
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {durationText || "Chưa chọn ngày kết thúc"}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Số lượng
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="0 = Vô hạn"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Đơn tối thiểu
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="0"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Hạng thành viên
              </label>
              <select
                className="w-full border p-2 rounded"
                value={form.requiredRank}
                onChange={(e) =>
                  setForm({ ...form, requiredRank: e.target.value })
                }
              >
                <option value="MEMBER">Tất cả (Member)</option>
                <option value="SILVER">Silver trở lên</option>
                <option value="GOLD">Gold trở lên</option>
                <option value="DIAMOND">Chỉ Diamond</option>
              </select>
            </div>
          </div>

          <div className="col-span-full border-t pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              disabled={createMut.isPending}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold transition transform active:scale-95 disabled:opacity-70"
            >
              {createMut.isPending ? "Đang lưu..." : "Tạo Mã Ngay"}
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH MÃ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons?.map((c) => {
          const isExpired = c.endDate && new Date(c.endDate) < new Date();
          const isOutOfStock = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
          const isHidden = !c.isActive;
          const requiredRank = String(c.requiredRank || "MEMBER").toUpperCase();
          const rankLabel = RANK_LABELS[requiredRank] || requiredRank;
          const rankClass = getRankBadgeClass(requiredRank);

          return (
            <div
              key={c._id}
              className={`bg-white p-5 rounded-xl border shadow-sm transition flex flex-col gap-3 relative group
                  ${
                    isHidden || isExpired
                      ? "border-gray-200 opacity-75 bg-gray-50"
                      : "border-blue-100 hover:shadow-md hover:border-blue-300"
                  }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <div
                      className={`font-mono font-bold text-lg flex items-center gap-1 ${
                        isHidden || isExpired
                          ? "text-gray-500 decoration-slice line-through"
                          : "text-blue-600"
                      }`}
                    >
                      <Ticket
                        size={18}
                        className={isHidden || isExpired ? "" : "rotate-45"}
                      />
                      <span className="break-all">{c.code}</span>
                    </div>

                    {/* Badge Status Thông Minh */}
                    {isHidden ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600 font-bold">
                        Đã ẩn
                      </span>
                    ) : isExpired ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600 font-bold">
                        Hết hạn
                      </span>
                    ) : isOutOfStock ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">
                        Hết lượt
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-600 font-bold animate-pulse">
                        Đang chạy
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-700 line-clamp-2 h-10">
                    {c.description}
                  </div>
                </div>

                {isAdmin ? (
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: true, couponId: c._id })
                    }
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <div className="p-2 text-gray-200 flex-shrink-0">
                    <Ban size={20} />
                  </div>
                )}
              </div>

              {/* Thông tin chi tiết dạng bảng nhỏ */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Giảm giá</span>
                  <span className="font-bold text-gray-800 text-sm">
                    {c.discountType === "percent"
                      ? `${c.value}%`
                      : `${c.value.toLocaleString()}đ`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users size={12} /> Lượt dùng
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Progress bar mini */}
                    {c.usageLimit > 0 && (
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              (c.usedCount / c.usageLimit) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    )}
                    <span
                      className={`font-bold ${
                        isOutOfStock ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {c.usedCount}/{c.usageLimit === 0 ? "∞" : c.usageLimit}
                    </span>
                  </div>
                </div>

                {/* ✅ Hạng áp dụng */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Hạng áp dụng</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold ${rankClass}`}
                    title={`Voucher dùng cho hạng ${rankLabel}`}
                  >
                    {rankLabel}
                  </span>
                </div>

                <div className="flex justify-between items-start pt-2 border-t border-gray-200 mt-1">
                  <span className="text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> Thời hạn
                  </span>
                  <div className="text-right">
                    <div className="text-gray-800 font-medium">
                      {formatDateDisplay(c.startDate)}
                    </div>
                    <div className="flex items-center gap-1 justify-end text-gray-400 my-0.5">
                      <ArrowRight size={10} />
                    </div>
                    <div
                      className={`font-medium ${
                        isExpired ? "text-red-500" : "text-orange-600"
                      }`}
                    >
                      {formatDateDisplay(c.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, couponId: null })}
        onConfirm={() => {
          if (deleteModal.couponId) {
            deleteMut.mutate(deleteModal.couponId, {
              onSuccess: () =>
                setDeleteModal({ isOpen: false, couponId: null }),
            });
          }
        }}
        title="Xóa Mã Giảm Giá"
        message="Bạn có chắc chắn muốn xóa mã này? Hành động này không thể hoàn tác."
        confirmText="Xóa ngay"
        isDanger={true}
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
