import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useUpdateProfile } from "../../../hooks/useAuth";
import { Crown, Star, Shield, Medal, Loader2 } from "lucide-react";

// ✅ Import Kho Voucher (Đảm bảo bạn đã tạo file VoucherWallet.jsx ở bước trước)
import VoucherWallet from "../components/VoucherWallet";
import StudentVerifyBox from "../components/StudentVerifyBox";

// --- Component RankBadge ---
function RankBadge({ rank }) {
  const config = {
    DIAMOND: {
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon: Crown,
      label: "Kim Cương",
    },
    GOLD: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Star,
      label: "Vàng",
    },
    SILVER: {
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Shield,
      label: "Bạc",
    },
    MEMBER: {
      color: "bg-gray-50 text-gray-500 border-gray-100",
      icon: Medal,
      label: "Thành viên",
    },
  };
  const { color, icon: Icon, label } = config[rank] || config.MEMBER;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-bold uppercase ${color}`}
    >
      <Icon size={14} /> {label}
    </span>
  );
}

const empty = {
  name: "",
  phone: "",
  email: "",
  gender: "",
  dob: { d: "", m: "", y: "" },
};

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const initial = useMemo(() => {
    if (!user) return empty;
    return {
      name: user.name ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
      gender: user.gender ?? "",
      dob: {
        d: user.dob?.d ?? "",
        m: user.dob?.m ?? "",
        y: user.dob?.y ?? "",
      },
    };
  }, [user]);

  const [form, setForm] = useState(initial);

  useEffect(() => setForm(initial), [initial]);

  const onSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      dob: form.dob,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. HEADER: Avatar + Rank Info */}
      <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm">
        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-3xl shadow-md border-4 border-blue-50">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {user?.name || "Xin chào"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <RankBadge rank={user?.rank} />
            <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
              Tổng chi tiêu:{" "}
              <span className="font-bold text-gray-900">
                {user?.totalSpent?.toLocaleString()}đ
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ✅ 2. KHO VOUCHER (Chèn vào giữa Header và Form) */}
      <VoucherWallet />
      <StudentVerifyBox />
      {/* 3. FORM CẬP NHẬT */}
      <div className="pt-2">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          Thông tin cá nhân
        </h2>

        <form
          onSubmit={onSubmit}
          className="space-y-5 max-w-3xl bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Họ Tên
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nhập họ tên của bạn"
                disabled={isPending}
              />
            </div>

            {/* SĐT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số điện thoại
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="09xxxxxxxx"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email{" "}
                <span className="text-xs font-normal text-gray-400">
                  (Không thể thay đổi)
                </span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                value={form.email}
                readOnly
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <div className="flex items-center gap-6 h-[42px]">
                {["male", "female", "other"].map((g) => (
                  <label
                    key={g}
                    className="inline-flex items-center gap-2 cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="gender"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={form.gender === g}
                      onChange={() => setForm((f) => ({ ...f, gender: g }))}
                      disabled={isPending}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors capitalize">
                      {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ngày sinh
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <select
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                value={form.dob?.d || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dob: { ...f.dob, d: e.target.value },
                  }))
                }
                disabled={isPending}
              >
                <option value="">Ngày</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                value={form.dob?.m || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dob: { ...f.dob, m: e.target.value },
                  }))
                }
                disabled={isPending}
              >
                <option value="">Tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                value={form.dob?.y || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dob: { ...f.dob, y: e.target.value },
                  }))
                }
                disabled={isPending}
              >
                <option value="">Năm</option>
                {Array.from({ length: 70 }, (_, i) => 2025 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 transition shadow-sm hover:shadow-md disabled:opacity-70 flex items-center gap-2"
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin" size={18} />}
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
