// src/Features/Account/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useUpdateProfile } from "../../../hooks/useAuth";

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

  // Build form từ dữ liệu BE (user)
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

  // Khi user load xong/đổi, sync lại form
  useEffect(() => setForm(initial), [initial]);

  const onSubmit = (e) => {
    e.preventDefault();
    // Gọi BE cập nhật: name/phone/gender/dob
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Thông tin tài khoản</h1>

      <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
        {/* Họ tên */}
        <div>
          <label className="block text-sm mb-1">Họ Tên</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Họ tên"
            disabled={isPending}
          />
        </div>

        {/* Giới tính */}
        <div>
          <label className="block text-sm mb-1">Giới tính</label>
          <div className="flex items-center gap-5">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "male"}
                onChange={() => setForm((f) => ({ ...f, gender: "male" }))}
                disabled={isPending}
              />
              Nam
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "female"}
                onChange={() => setForm((f) => ({ ...f, gender: "female" }))}
                disabled={isPending}
              />
              Nữ
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "" || form.gender === "other"}
                onChange={() => setForm((f) => ({ ...f, gender: "other" }))}
                disabled={isPending}
              />
              Khác / Chưa chọn
            </label>
          </div>
        </div>

        {/* SĐT + Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Số điện thoại</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="Số điện thoại"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              value={form.email}
              readOnly
            />
          </div>
        </div>

        {/* Ngày sinh */}
        <div>
          <label className="block text-sm mb-1">Ngày sinh</label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <select
              className="rounded-lg border px-3 py-2"
              value={form.dob?.d || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, dob: { ...f.dob, d: e.target.value } }))
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
              className="rounded-lg border px-3 py-2"
              value={form.dob?.m || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, dob: { ...f.dob, m: e.target.value } }))
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
              className="rounded-lg border px-3 py-2"
              value={form.dob?.y || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, dob: { ...f.dob, y: e.target.value } }))
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

        <button
          className="rounded-lg bg-red-600 text-white font-semibold px-5 py-2.5"
          disabled={isPending}
        >
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </>
  );
}
