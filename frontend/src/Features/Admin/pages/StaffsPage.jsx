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
import ConfirmModal from "../components/ConfirmModal.jsx";
import StaffStats from "../components/StaffStats.jsx"; // ✅ 1. Import Component Mới
import {
  Search,
  Plus,
  Check,
  X,
  Pencil,
  Briefcase,
  Shield,
  Filter,
} from "lucide-react";

// --- Component Avatar & Badge (Giữ nguyên hoặc tách ra file riêng nếu muốn) ---
function Avatar({ name }) {
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  const colors = [
    "bg-red-100 text-red-600",
    "bg-orange-100 text-orange-600",
    "bg-amber-100 text-amber-600",
    "bg-green-100 text-green-600",
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
    "bg-sky-100 text-sky-600",
    "bg-blue-100 text-blue-600",
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-purple-100 text-purple-600",
    "bg-fuchsia-100 text-fuchsia-600",
    "bg-pink-100 text-pink-600",
    "bg-rose-100 text-rose-600",
  ];
  const colorClass = colors[(name?.length || 0) % colors.length];

  return (
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${colorClass}`}
    >
      {initial}
    </div>
  );
}

function RoleBadge({ role }) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
        <Shield size={10} /> ADMIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
      <Briefcase size={10} /> STAFF
    </span>
  );
}

export default function StaffsPage() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  // Inline Edit States
  const [editingName, setEditingName] = useState(null);
  const [nameValue, setNameValue] = useState("");
  const [editingSalary, setEditingSalary] = useState(null);
  const [salaryValue, setSalaryValue] = useState("");

  // Confirm Modal State
  const [confirmAction, setConfirmAction] = useState(null);

  // Hooks
  const { data, isLoading, isError, refetch } = useStaffs({
    page,
    limit: 20,
    q,
    role: roleFilter,
  });
  const createMut = useCreateStaff();
  const updateMut = useUpdateStaff();
  const toggleMut = useToggleActiveStaff();
  const deleteMut = useDeleteStaff();

  const list = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: 0 };

  // --- Handlers ---
  const handleEditName = (staff) => {
    setEditingName(staff.id);
    setNameValue(staff.name || "");
  };
  const handleSaveName = (staffId) => {
    if (!nameValue.trim()) return;
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
  const executeConfirmAction = () => {
    if (!confirmAction) return;
    const { type, data } = confirmAction;
    if (type === "delete") {
      deleteMut.mutate(data.id, { onSuccess: () => setConfirmAction(null) });
    } else if (type === "block") {
      toggleMut.mutate(
        { id: data.id, active: !data.active },
        { onSuccess: () => setConfirmAction(null) }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Quản lý nhân viên
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý đội ngũ, phân quyền và theo dõi trạng thái hoạt động.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all"
          >
            <Plus size={18} />
            Thêm nhân viên mới
          </button>
        )}
      </div>

      {/* ✅ 2. Stats Component (Đã tách riêng) */}
      <StaffStats list={list} total={meta.total} />

      {/* 3. Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-shadow"
              placeholder="Tìm tên, email nhân viên..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              className="appearance-none rounded-lg border border-gray-200 pl-9 pr-8 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="staff">Nhân viên (Staff)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Lương cơ bản</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Ngày tham gia</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-rose-500"
                  >
                    Lỗi khi tải dữ liệu
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy nhân viên nào.
                  </td>
                </tr>
              ) : (
                list.map((u) => {
                  const isRowAdmin = String(u.role).toLowerCase() === "admin";
                  const canEdit = isAdmin;
                  const canDelete =
                    isAdmin && String(user?.id) !== String(u.id) && !isRowAdmin;
                  const canToggle =
                    isAdmin && String(user?.id) !== String(u.id);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Avatar + Name + Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div className="flex-1 min-w-0">
                            {/* Inline Edit Name */}
                            {editingName === u.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  className="w-32 px-1.5 py-0.5 text-sm border rounded focus:border-blue-500 outline-none"
                                  value={nameValue}
                                  onChange={(e) => setNameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveName(u.id);
                                    if (e.key === "Escape")
                                      setEditingName(null);
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveName(u.id)}
                                  className="text-green-600 hover:bg-green-50 rounded p-0.5"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingName(null)}
                                  className="text-gray-500 hover:bg-gray-100 rounded p-0.5"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900 truncate">
                                  {u.name || "Chưa đặt tên"}
                                </div>
                                {canEdit && (
                                  <button
                                    onClick={() => handleEditName(u)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                                    title="Đổi tên"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Salary */}
                      <td className="px-4 py-3">
                        {editingSalary === u.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-24 px-1.5 py-0.5 text-sm border rounded focus:border-blue-500 outline-none"
                              value={salaryValue}
                              onChange={(e) => setSalaryValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveSalary(u.id);
                                if (e.key === "Escape") setEditingSalary(null);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSalary(u.id)}
                              className="text-green-600 hover:bg-green-50 rounded p-0.5"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingSalary(null)}
                              className="text-gray-500 hover:bg-gray-100 rounded p-0.5"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`text-sm font-medium text-gray-700 ${
                              canEdit
                                ? "cursor-pointer hover:text-blue-600 border-b border-dashed border-transparent hover:border-blue-300 inline-block"
                                : ""
                            }`}
                            onClick={() => canEdit && handleEditSalary(u)}
                            title={canEdit ? "Click để sửa lương" : ""}
                          >
                            {u.salary > 0
                              ? `${u.salary.toLocaleString()}đ`
                              : "---"}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            u.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              u.active ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          ></span>
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          {canToggle && (
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "block", data: u })
                              }
                              className={`text-xs font-medium hover:underline ${
                                u.active ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {u.active ? "Khóa" : "Mở khóa"}
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "delete", data: u })
                              }
                              className="text-xs font-medium text-rose-600 hover:underline hover:text-rose-700"
                            >
                              Xóa
                            </button>
                          )}
                          {!canToggle && !canDelete && (
                            <span className="text-gray-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs text-gray-500">
            Hiển thị {(page - 1) * 20 + 1} - {Math.min(page * 20, meta.total)}{" "}
            trên tổng {meta.total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= meta.total}
              className="px-3 py-1 rounded bg-white border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Xóa nhân viên"
            : confirmAction?.data.active
            ? "Khóa tài khoản"
            : "Mở khóa tài khoản"
        }
        message={
          confirmAction?.type === "delete"
            ? `Bạn có chắc chắn muốn xóa nhân viên "${confirmAction?.data.name}"? Hành động này không thể hoàn tác.`
            : `Bạn có muốn ${
                confirmAction?.data.active ? "khóa" : "kích hoạt lại"
              } quyền truy cập của "${confirmAction?.data.name}"?`
        }
        confirmText={
          confirmAction?.type === "delete" ? "Xóa vĩnh viễn" : "Xác nhận"
        }
        isDanger={
          confirmAction?.type === "delete" ||
          (confirmAction?.type === "block" && confirmAction?.data.active)
        }
        isLoading={deleteMut.isLoading || toggleMut.isLoading}
      />
    </div>
  );
}
