// src/Features/Admin/pages/CustomersPage.jsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCustomers, useCustomerActions } from "../../../hooks/useCustomers";
import {
  useAuth,
  usePendingStudentRequests,
  useVerifyStudentRequest,
} from "../../../hooks/useAuth";

import {
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  ShieldBan,
  ShieldCheck,
  Filter,
  X,
  Crown,
  Star,
  Shield,
  Medal,
} from "lucide-react";

import CustomerStatsCards from "../components/CustomerStatsCards";
import CustomerOrdersPanel from "../components/CustomerOrdersPanel";
import CustomerEditModal from "../components/CustomerEditModal";
import ConfirmModal from "../components/ConfirmModal";

// ✅ Panel duyệt sinh viên (component chỉ render, không gọi query)
import StudentVerifyRequestsPanel from "../components/StudentVerifyRequestsPanel";

// --- COMPONENT: HUY HIỆU XẾP HẠNG (RANK BADGE) - MÀU ĐẬM ĐÀ ---
function RankBadge({ rank }) {
  const config = {
    DIAMOND: {
      className: "bg-cyan-100 text-cyan-800 border-cyan-300 shadow-sm",
      icon: Crown,
      label: "Diamond",
    },
    GOLD: {
      className: "bg-amber-100 text-amber-800 border-amber-300 shadow-sm",
      icon: Star,
      label: "Gold",
    },
    SILVER: {
      className: "bg-slate-200 text-slate-700 border-slate-300",
      icon: Shield,
      label: "Silver",
    },
    MEMBER: {
      className: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Medal,
      label: "Member",
    },
  };

  const { className, icon: Icon, label } = config[rank] || config.MEMBER;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${className} shrink-0`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}

// --- COMPONENT: HUY HIỆU TRẠNG THÁI ---
function StatusBadge({ status }) {
  const isBlocked = status === "blocked";
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isBlocked
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
      }`}
    >
      {isBlocked ? <ShieldBan size={11} /> : <ShieldCheck size={11} />}
      {isBlocked ? "Đã chặn" : "Hoạt động"}
    </span>
  );
}

// --- MAIN PAGE ---
export default function CustomersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [tempQ, setTempQ] = useState("");

  // --- STATE MODALS ---
  const [openHistory, setOpenHistory] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // --- HOOKS: CUSTOMER ---
  const { data, isLoading, refetch } = useCustomers({
    page,
    q: tempQ,
    status,
  });
  const { updateMutation, blockMutation, deleteMutation } =
    useCustomerActions();

  const list = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // --- HOOKS: STUDENT VERIFY (gọi ở PAGE, không gọi trong component con) ---
  const pendingRq = usePendingStudentRequests();
  const verifyRq = useVerifyStudentRequest();

  // Normalize list pending (tùy backend bọc data)
  const pendingList =
    pendingRq.data?.data?.data ?? pendingRq.data?.data ?? pendingRq.data ?? [];

  const handleApproveStudent = (u) => {
    verifyRq.mutate(
      { userId: u.id, status: "verified" },
      {
        onSuccess: () => {
          // ✅ refresh thêm list customers + stats
          qc.invalidateQueries({ queryKey: ["adminCustomers"] });
          qc.invalidateQueries({ queryKey: ["adminCustomerStats"] });
        },
      }
    );
  };

  const handleRejectStudent = (userId, rejectedReason) => {
    verifyRq.mutate(
      { userId, status: "rejected", rejectedReason },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["adminCustomers"] });
          qc.invalidateQueries({ queryKey: ["adminCustomerStats"] });
        },
      }
    );
  };

  // --- HANDLERS: SEARCH / FILTER ---
  const handleClearSearch = () => {
    setQ("");
    setTempQ("");
    setPage(1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQ(val);
    if (val === "") {
      setTempQ("");
      setPage(1);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setTempQ(q);
      setPage(1);
    }
  };

  const triggerSearch = () => {
    setTempQ(q);
    setPage(1);
  };

  // --- HANDLERS: UPDATE / BLOCK / DELETE ---
  const handleUpdateUser = (formData) => {
    if (!editingUser) return;
    updateMutation.mutate(
      { id: editingUser.id, data: formData },
      {
        onSuccess: () => setEditingUser(null),
      }
    );
  };

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    const { type, data } = confirmAction;

    if (type === "delete") {
      deleteMutation.mutate(data.id, {
        onSuccess: () => setConfirmAction(null),
      });
    } else if (type === "block") {
      blockMutation.mutate(
        { id: data.id, block: data.status === "active" },
        { onSuccess: () => setConfirmAction(null) }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Stats */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Quản lý khách hàng
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Theo dõi thông tin khách hàng, xếp hạng thành viên và lịch sử mua sắm.
        </p>
        <CustomerStatsCards />
      </div>

      {/* ✅ 1.5 Panel duyệt xác thực sinh viên */}
      {isAdmin && (
        <StudentVerifyRequestsPanel
          pendingList={pendingList}
          isLoading={pendingRq.isLoading}
          isProcessing={verifyRq.isPending}
          onApprove={handleApproveStudent}
          onReject={handleRejectStudent}
        />
      )}

      {/* 2. Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* INPUT TÌM KIẾM */}
          <div className="relative flex-1 md:w-80">
            <button
              onClick={triggerSearch}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600"
            >
              <Search size={16} />
            </button>

            <input
              className="w-full rounded-lg border border-gray-200 pl-9 pr-9 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Tìm tên, email, SĐT..."
              value={q}
              onChange={handleInputChange}
              onKeyDown={handleSearch}
            />

            {q && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-rose-500 hover:bg-gray-100 rounded-full transition-all"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* FILTER STATUS */}
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              className="appearance-none rounded-lg border border-gray-200 pl-9 pr-8 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="blocked">Đã chặn</option>
            </select>
          </div>
        </div>

        {/* REFRESH */}
        <button
          onClick={() => {
            setQ("");
            setTempQ("");
            setStatus("");
            setPage(1);
            refetch();
          }}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
          title="Làm mới & Xóa bộ lọc"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* 3. Table Data */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3 text-center">Đơn hàng</th>
                <th className="px-4 py-3 text-right">Tổng chi tiêu</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
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
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                list.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* CỘT KHÁCH HÀNG */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-white shadow-sm">
                          {u.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="flex flex-col min-w-0">
                          {/* Tên + Rank */}
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-gray-900 truncate max-w-[140px] lg:max-w-[180px]"
                              title={u.displayName}
                            >
                              {u.displayName}
                            </span>
                            <RankBadge rank={u.rank} />
                          </div>

                          {/* ID */}
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                            ID: {u.id.slice(-6).toUpperCase()}
                          </div>

                          {/* ✅ OPTIONAL: badge SV ngay trong list (nếu API có studentInfo) */}
                          {u.studentInfo?.status &&
                            u.studentInfo.status !== "none" && (
                              <div className="mt-1">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block ${
                                    u.studentInfo.status === "verified"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : u.studentInfo.status === "pending"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  {u.studentInfo.status === "verified"
                                    ? "SV ĐÃ DUYỆT"
                                    : u.studentInfo.status === "pending"
                                    ? "SV CHỜ DUYỆT"
                                    : "SV BỊ TỪ CHỐI"}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </td>

                    {/* CỘT LIÊN HỆ */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col max-w-[200px]">
                        <span
                          className="text-gray-700 truncate"
                          title={u.email}
                        >
                          {u.email}
                        </span>
                        <span className="text-xs text-gray-400">
                          {u.displayPhone || "Chưa có SĐT"}
                        </span>
                      </div>
                    </td>

                    {/* CỘT ĐƠN HÀNG */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 font-medium text-gray-700 text-xs">
                        {u.totalOrders} đơn
                      </span>
                    </td>

                    {/* CỘT TỔNG CHI TIÊU */}
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {u.totalSpent?.toLocaleString()}đ
                    </td>

                    {/* CỘT TRẠNG THÁI */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={u.status} />
                    </td>

                    {/* CỘT THAO TÁC */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setViewingUser(u);
                            setOpenHistory(true);
                          }}
                          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                setConfirmAction({ type: "block", data: u })
                              }
                              className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                                u.status === "active"
                                  ? "text-amber-500 hover:text-amber-600"
                                  : "text-emerald-500 hover:text-emerald-600"
                              }`}
                              title={
                                u.status === "active"
                                  ? "Chặn tài khoản"
                                  : "Mở khóa"
                              }
                            >
                              {u.status === "active" ? (
                                <ShieldBan size={16} />
                              ) : (
                                <ShieldCheck size={16} />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                setConfirmAction({ type: "delete", data: u })
                              }
                              className="p-1.5 rounded text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Xóa khách hàng"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs text-gray-500">
            Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, meta.total)}{" "}
            trên tổng {meta.total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="px-3 py-1 rounded bg-white border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerOrdersPanel
        open={openHistory}
        onClose={() => {
          setOpenHistory(false);
          setViewingUser(null);
        }}
        customer={viewingUser}
      />

      <CustomerEditModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        customer={editingUser}
        onSave={handleUpdateUser}
        isLoading={updateMutation.isLoading}
      />

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Xóa khách hàng"
            : confirmAction?.data.status === "active"
            ? "Chặn khách hàng"
            : "Mở khóa khách hàng"
        }
        message={
          confirmAction?.type === "delete"
            ? `Bạn có chắc chắn muốn xóa khách hàng "${confirmAction?.data.displayName}"? Hành động này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn ${
                confirmAction?.data.status === "active" ? "chặn" : "mở khóa"
              } khách hàng "${confirmAction?.data.displayName}"?`
        }
        confirmText={
          confirmAction?.type === "delete" ? "Xóa vĩnh viễn" : "Xác nhận"
        }
        isDanger={
          confirmAction?.type === "delete" ||
          (confirmAction?.type === "block" &&
            confirmAction?.data.status === "active")
        }
        isLoading={deleteMutation.isLoading || blockMutation.isLoading}
      />
    </div>
  );
}
