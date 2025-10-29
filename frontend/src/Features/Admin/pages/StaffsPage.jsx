// src/Features/Admin/pages/StaffsPage.jsx
import { useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStaffs,
  createStaff,
  toggleActiveStaff,
  resetStaffPassword,
  updateStaff,
} from "../api/staffs";
import StaffModal from "../components/StaffModal.jsx";
import { Search } from "lucide-react";

function RoleBadge({ role }) {
  const r = String(role || "").toLowerCase();
  const map = {
    admin: ["bg-purple-50 text-purple-700", "ADMIN"],
    staff: ["bg-sky-50 text-sky-700", "STAFF"],
  };
  const [cls, label] = map[r] || ["bg-gray-100 text-gray-700", r.toUpperCase()];
  return (
    <span className={`px-2 py-[2px] rounded-full text-xs ${cls}`}>{label}</span>
  );
}

export default function StaffsPage() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminStaffs", { page, q }],
    queryFn: () => fetchStaffs({ page, limit: 20, q }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: (form) => createStaff(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminStaffs"] });
      setOpenCreate(false);
    },
  });

  const activeMut = useMutation({
    mutationFn: ({ id, active }) => toggleActiveStaff({ id, active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminStaffs"] }),
  });

  const resetPwMut = useMutation({
    mutationFn: ({ id }) => resetStaffPassword({ id }),
    onSuccess: () =>
      alert("Đã đặt lại mật khẩu và gửi hướng dẫn cho nhân viên."),
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ id, role }) => updateStaff({ id, patch: { role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminStaffs"] }),
  });

  const list = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: list.length };

  const rows = useMemo(
    () =>
      list.map((u) => {
        const role = String(u.role || "").toLowerCase();
        const canToggle = isAdmin && String(user?.id) !== String(u.id); // không tự khoá chính mình
        const canUpdateRole = isAdmin && String(user?.id) !== String(u.id);
        const canResetPassword = isAdmin;

        return (
          <tr key={u.id} className="border-b">
            <td className="px-3 py-2 font-medium">{u.name || "-"}</td>
            <td className="px-3 py-2">{u.email}</td>
            <td className="px-3 py-2">
              <RoleBadge role={role} />
            </td>
            <td className="px-3 py-2">
              <span
                className={`px-2 py-[2px] rounded-full text-xs ${
                  u.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {u.active ? "Đang hoạt động" : "Đã khoá"}
              </span>
            </td>
            <td className="px-3 py-2 text-sm text-gray-500">
              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
            </td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                {/* đổi role */}
                {canUpdateRole && (
                  <select
                    className="rounded border px-2 py-1 text-sm"
                    value={role}
                    onChange={(e) =>
                      updateRoleMut.mutate({ id: u.id, role: e.target.value })
                    }
                  >
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                )}
                {/* bật/tắt hoạt động */}
                {canToggle && (
                  <button
                    className="px-2 py-1 rounded border text-sm hover:bg-gray-50"
                    onClick={() =>
                      activeMut.mutate({ id: u.id, active: !u.active })
                    }
                  >
                    {u.active ? "Khoá" : "Mở khoá"}
                  </button>
                )}
                {/* reset mật khẩu */}
                {canResetPassword && (
                  <button
                    className="px-2 py-1 rounded border text-sm hover:bg-gray-50"
                    onClick={() => resetPwMut.mutate({ id: u.id })}
                  >
                    Reset mật khẩu
                  </button>
                )}
              </div>
            </td>
          </tr>
        );
      }),
    [
      list,
      isAdmin,
      user?.id,
      activeMut.isLoading,
      resetPwMut.isLoading,
      updateRoleMut.isLoading,
    ]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Quản lý nhân viên</h1>

        {/* Chỉ ADMIN thấy nút tạo */}
        {isAdmin && (
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-lg bg-red-600 text-white px-4 py-2"
          >
            + Tạo nhân viên
          </button>
        )}
      </div>

      {/* Bộ lọc */}
      <div className="mb-4 max-w-md">
        <div className="relative">
          <input
            className="w-full rounded-lg border px-3 py-2 pr-9"
            placeholder="Tìm theo tên hoặc email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Bảng */}
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Vai trò</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Đăng nhập gần đây</th>
              <th className="px-3 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center">
                  Đang tải…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-rose-600">
                  Không tải được dữ liệu
                </td>
              </tr>
            ) : rows.length ? (
              rows
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  Chưa có nhân viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang đơn giản */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Trang trước
        </button>
        <div className="text-sm text-gray-600">Trang {meta.page}</div>
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={list.length < (meta.limit || 20)}
        >
          Trang sau
        </button>
      </div>

      {/* Modal tạo nhân viên — admin only */}
      <StaffModal
        open={openCreate && isAdmin}
        onClose={() => setOpenCreate(false)}
        onSubmit={(form, done) => {
          createMut.mutate(form, {
            onSuccess: () => done?.(),
          });
        }}
      />
    </div>
  );
}
