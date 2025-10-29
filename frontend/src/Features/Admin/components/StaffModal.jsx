// src/Features/Admin/components/StaffModal.jsx
import { useState } from "react";

export default function StaffModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Vui lòng nhập đủ Họ tên, Email, Mật khẩu");
      return;
    }
    onSubmit(form, () => {
      setForm({ name: "", email: "", password: "" });
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-xl bg-white p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold">Tạo tài khoản nhân viên</h3>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Họ tên"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Mật khẩu"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Tạo nhân viên
          </button>
        </div>
      </form>
    </div>
  );
}
