// src/components/StaffModal.jsx - WITH SALARY (Modern UI)
import { useState } from "react";

export default function StaffModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
  });

  const submit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Vui lòng nhập đủ Họ tên, Email, Mật khẩu");
      return;
    }

    // Convert salary to number
    const payload = {
      ...form,
      salary: Number(form.salary) || 0,
    };

    onSubmit(payload, () => {
      setForm({ name: "", email: "", password: "", salary: "" });
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm transition-opacity">
      <form
        onSubmit={submit}
        className="w-full max-w-xl rounded-xl bg-white p-8 shadow-xl"
      >
        <h3 className="text-xl font-semibold border-b border-gray-200 pb-4">
          Tạo tài khoản nhân viên
        </h3>

        <div className="mt-6 space-y-5">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
              placeholder="email@example.com"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
              placeholder="Tối thiểu 6 ký tự"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>

          {/* ✅ NEW: Lương */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lương (VNĐ/tháng)
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
              placeholder="5000000"
              type="number"
              min="0"
              step="100000"
              value={form.salary}
              onChange={(e) =>
                setForm((f) => ({ ...f, salary: e.target.value }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Để trống nếu chưa xác định
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 font-medium cursor-pointer transition-all duration-150"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md"
          >
            Tạo nhân viên
          </button>
        </div>
      </form>
    </div>
  );
}
