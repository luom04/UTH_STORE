// src/pages/StaffsPage.jsx - FULL INLINE EDIT + CURSOR POINTER
import { useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useStaffs,
  useCreateStaff,
  useUpdateStaff,
  useToggleActiveStaff,
  useDeleteStaff,
} from "../../../hooks/useStaffs";
import StaffModal from "../components/StaffModal.jsx";
import { Search, Plus, Check, X, Pencil } from "lucide-react";

function RoleBadge({ role }) {
  const r = String(role || "").toLowerCase();
  const map = {
    admin: ["bg-purple-50 text-purple-700", "ADMIN"],
    staff: ["bg-sky-50 text-sky-700", "STAFF"],
  };
  const [cls, label] = map[r] || ["bg-gray-100 text-gray-700", r.toUpperCase()];
  return (
    <span className={`px-2 py-[2px] rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function StaffsPage() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  // ✅ Editing states
  const [editingName, setEditingName] = useState(null); // staffId
  const [nameValue, setNameValue] = useState("");
  const [editingSalary, setEditingSalary] = useState(null); // staffId
  const [salaryValue, setSalaryValue] = useState("");

  // Hooks
  const { data, isLoading, isError } = useStaffs({ page, limit: 20, q });
  const createMut = useCreateStaff();
  const updateMut = useUpdateStaff();
  const toggleMut = useToggleActiveStaff();
  const deleteMut = useDeleteStaff();

  const list = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: list.length };

  // ✅ Handle name edit
  const handleEditName = (staff) => {
    setEditingName(staff.id);
    setNameValue(staff.name || "");
  };

  const handleSaveName = (staffId) => {
    if (!nameValue.trim()) {
      alert("Tên không được để trống!");
      return;
    }
    updateMut.mutate(
      { id: staffId, patch: { name: nameValue } },
      {
        onSuccess: () => {
          setEditingName(null);
          setNameValue("");
        },
      }
    );
  };

  const handleCancelNameEdit = () => {
    setEditingName(null);
    setNameValue("");
  };

  // ✅ Handle salary edit
  const handleEditSalary = (staff) => {
    setEditingSalary(staff.id);
    setSalaryValue(staff.salary || 0);
  };

  const handleSaveSalary = (staffId) => {
    updateMut.mutate(
      { id: staffId, patch: { salary: Number(salaryValue) || 0 } },
      {
        onSuccess: () => {
          setEditingSalary(null);
          setSalaryValue("");
        },
      }
    );
  };

  const handleCancelSalaryEdit = () => {
    setEditingSalary(null);
    setSalaryValue("");
  };

  const rows = useMemo(
    () =>
      list.map((u) => {
        const role = String(u.role || "").toLowerCase();
        const canToggle = isAdmin && String(user?.id) !== String(u.id);
        const canDelete =
          isAdmin && String(user?.id) !== String(u.id) && role !== "admin";
        const canEdit = isAdmin;

        return (
          <tr key={u.id} className="border-b hover:bg-gray-50">
            {/* ✅ Họ tên - Inline Edit */}
            <td className="px-3 py-2">
              {editingName === u.id ? (
                // Edit mode
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border rounded"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName(u.id);
                      if (e.key === "Escape") handleCancelNameEdit();
                    }}
                    autoFocus
                  />
                  <button
                    className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                    onClick={() => handleSaveName(u.id)}
                    title="Lưu"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={handleCancelNameEdit}
                    title="Hủy"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                // View mode
                <div className="flex items-center gap-2">
                  <span className="font-medium">{u.name || "-"}</span>
                  {canEdit && (
                    <button
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded cursor-pointer transition-opacity"
                      onClick={() => handleEditName(u)}
                      title="Sửa tên"
                    >
                      <Pencil size={14} className="text-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </td>

            {/* Email - Read only */}
            <td className="px-3 py-2 text-gray-600">{u.email}</td>

            {/* Vai trò */}
            <td className="px-3 py-2">
              <RoleBadge role={role} />
            </td>

            {/* ✅ Lương - Inline Edit */}
            <td className="px-3 py-2">
              {editingSalary === u.id ? (
                // Edit mode
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-32 px-2 py-1 text-sm border rounded"
                    value={salaryValue}
                    onChange={(e) => setSalaryValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSalary(u.id);
                      if (e.key === "Escape") handleCancelSalaryEdit();
                    }}
                    autoFocus
                  />
                  <button
                    className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                    onClick={() => handleSaveSalary(u.id)}
                    title="Lưu"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={handleCancelSalaryEdit}
                    title="Hủy"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                // View mode
                <button
                  className={`text-left text-sm ${
                    canEdit
                      ? "hover:text-blue-600 cursor-pointer"
                      : "cursor-default"
                  }`}
                  onClick={() => canEdit && handleEditSalary(u)}
                  disabled={!canEdit}
                  title={canEdit ? "Click để sửa" : ""}
                >
                  {u.salary > 0
                    ? `${u.salary.toLocaleString("vi-VN")}đ`
                    : "Chưa xác định"}
                </button>
              )}
            </td>

            {/* Trạng thái */}
            <td className="px-3 py-2">
              <span
                className={`px-2 py-[2px] rounded-full text-xs font-medium ${
                  u.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {u.active ? "Đang hoạt động" : "Đã khoá"}
              </span>
            </td>

            {/* Ngày tạo */}
            <td className="px-3 py-2 text-sm text-gray-500">
              {u.createdAt
                ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                : "—"}
            </td>

            {/* Thao tác */}
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                {/* Bật/tắt */}
                {canToggle && (
                  <button
                    className="px-2 py-1 rounded border text-xs hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      toggleMut.mutate({ id: u.id, active: !u.active })
                    }
                  >
                    {u.active ? "Khoá" : "Mở khoá"}
                  </button>
                )}

                {/* Xóa */}
                {canDelete && (
                  <button
                    className="px-2 py-1 rounded border text-xs hover:bg-rose-50 text-rose-600 cursor-pointer"
                    onClick={() => {
                      if (confirm(`Xóa nhân viên "${u.name}"?`)) {
                        deleteMut.mutate(u.id);
                      }
                    }}
                  >
                    Xóa
                  </button>
                )}

                {/* Dash nếu không có action */}
                {!canToggle && !canDelete && (
                  <span className="text-xs text-gray-400">-</span>
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
      toggleMut,
      deleteMut,
      updateMut,
      editingName,
      nameValue,
      editingSalary,
      salaryValue,
    ]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Quản lý nhân viên
        </h1>

        {isAdmin && (
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus size={18} />
            Tạo nhân viên
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 max-w-md">
        <div className="relative">
          <input
            className="w-full rounded-lg border px-3 py-2 pr-9"
            placeholder="Tìm theo tên hoặc email…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="min-w-[960px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Họ tên</th>
              <th className="px-3 py-3 text-left font-semibold">Email</th>
              <th className="px-3 py-3 text-left font-semibold">Vai trò</th>
              <th className="px-3 py-3 text-left font-semibold">Lương</th>
              <th className="px-3 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-3 py-3 text-left font-semibold">Ngày tạo</th>
              <th className="px-3 py-3 text-left font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="group">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-rose-600">
                  Không tải được dữ liệu
                </td>
              </tr>
            ) : rows.length ? (
              rows
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  Chưa có nhân viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination - WITH CURSOR POINTER */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Trang trước
        </button>
        <div className="text-sm text-gray-600">
          Trang {meta.page} / {meta.totalPages || 1}
        </div>
        <button
          className="px-3 py-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (meta.totalPages || 1)}
        >
          Trang sau
        </button>
      </div>

      {/* Modal tạo nhân viên */}
      {isAdmin && (
        <StaffModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSubmit={(form, done) => {
            createMut.mutate(form, {
              onSuccess: () => {
                setOpenCreate(false);
                done?.();
              },
            });
          }}
        />
      )}
    </div>
  );
}
