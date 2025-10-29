import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  ShieldBan,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import CustomerOrdersPanel from "../components/CustomerOrdersPanel";

// ========== MOCK / FALLBACK ==========
async function fetchCustomers({ page = 1, limit = 20, q = "", status = "" }) {
  // const res = await fetch(`/api/v1/admin/customers?page=${page}&limit=${limit}&q=${q}&status=${status}`, { credentials: "include" });
  // if (!res.ok) throw new Error("Failed");
  // return await res.json();
  return {
    success: true,
    data: [
      {
        id: "U1001",
        name: "Nguyễn Văn A",
        email: "a@example.com",
        phone: "0900000001",
        totalOrders: 5,
        totalSpent: 125990000,
        status: "active", // active | blocked
        createdAt: "2025-09-01T09:00:00.000Z",
      },
      {
        id: "U1002",
        name: "Trần Thị B",
        email: "b@example.com",
        phone: "0900000002",
        totalOrders: 1,
        totalSpent: 15990000,
        status: "blocked",
        createdAt: "2025-09-10T13:00:00.000Z",
      },
    ],
    meta: { page, limit, total: 2 },
  };
}

async function updateCustomer({ id, payload }) {
  // const res = await fetch(`/api/v1/admin/customers/${id}`, { method:"PUT", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
  // if (!res.ok) throw new Error("Failed");
  // return await res.json();
  return { success: true };
}

async function toggleBlockCustomer({ id, block }) {
  // await fetch(`/api/v1/admin/customers/${id}/${block ? "block" : "unblock"}`, { method:"PATCH", credentials:"include" })
  return { success: true };
}

async function deleteCustomer(id) {
  // await fetch(`/api/v1/admin/customers/${id}`, { method:"DELETE", credentials:"include" })
  return { success: true };
}

// ========== TIỆN ÍCH HIỂN THỊ ==========
function StatusBadge({ status }) {
  const map = {
    active: { cls: "bg-emerald-50 text-emerald-700", label: "Đang hoạt động" },
    blocked: { cls: "bg-rose-50 text-rose-700", label: "Đã chặn" },
  };
  const s = map[status] || {
    cls: "bg-gray-100 text-gray-700",
    label: status || "-",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[2px] text-xs ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

// ========== MODAL XEM/SỬA NHANH ==========
function CustomerModal({ open, onClose, initial, onSave, canEdit }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", phone: "", status: "active", note: "" }
  );
  if (!open) return null;

  const save = (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.email?.trim()) {
      alert("Vui lòng nhập Tên & Email.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form
        onSubmit={save}
        className="w-full max-w-xl rounded-xl bg-white p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Họ tên"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={!canEdit}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={!canEdit}
          />
        </div>
        <input
          className="rounded-lg border px-3 py-2 w-full"
          placeholder="Số điện thoại"
          value={form.phone || ""}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          disabled={!canEdit}
        />
        <div className="grid md:grid-cols-2 gap-3">
          <select
            className="rounded-lg border px-3 py-2"
            value={form.status || "active"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            disabled={!canEdit}
          >
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Đã chặn</option>
          </select>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Ghi chú nội bộ"
            value={form.note || ""}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Đóng
          </button>
          {canEdit && (
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Lưu
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function CustomersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(""); // "", "active", "blocked"

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [viewing, setViewing] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCustomers", { page, q, status }],
    queryFn: () => fetchCustomers({ page, limit: 20, q, status }),
    keepPreviousData: true,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateCustomer({ id, payload }),
    onSuccess: () => {
      setOpenModal(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
  });

  const blockMut = useMutation({
    mutationFn: ({ id, block }) => toggleBlockCustomer({ id, block }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminCustomers"] }),
  });

  const delMut = useMutation({
    mutationFn: (id) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminCustomers"] }),
  });

  const list = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: list.length };

  const rows = useMemo(
    () =>
      list.map((u) => {
        const blockable = u.status === "active" || u.status === "blocked";
        return (
          <tr key={u.id} className="border-b">
            <td className="px-3 py-2">
              <div className="font-medium">{u.name || "-"}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </td>
            <td className="px-3 py-2">{u.phone || "-"}</td>
            <td className="px-3 py-2">{u.totalOrders || 0}</td>
            <td className="px-3 py-2 font-semibold text-red-600">
              {u.totalSpent?.toLocaleString()}đ
            </td>
            <td className="px-3 py-2">
              <StatusBadge status={u.status} />
            </td>
            <td className="px-3 py-2 text-sm text-gray-500">
              {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
            </td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                {/* Xem nhanh (ai cũng thấy) */}
                <button
                  className="px-2 py-1.5 rounded border text-sm hover:bg-gray-50"
                  title="Xem lịch sử"
                  onClick={() => {
                    setViewing(u);
                    setOpenHistory(true);
                  }}
                >
                  <Eye size={16} />
                </button>

                {/* Sửa nhanh: admin có thể sửa thông tin; staff có thể sửa note/status? (tuỳ bạn) */}
                {isAdmin && (
                  <button
                    className="px-2 py-1.5 rounded border text-sm hover:bg-gray-50"
                    title="Sửa"
                    onClick={() => {
                      setEditing(u);
                      setOpenModal(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                )}

                {/* Chặn/Mở chặn: admin mới có */}
                {isAdmin && blockable && (
                  <button
                    className="px-2 py-1.5 rounded border text-sm hover:bg-gray-50"
                    title={
                      u.status === "blocked" ? "Bỏ chặn" : "Chặn khách hàng"
                    }
                    onClick={() =>
                      blockMut.mutate({
                        id: u.id,
                        block: u.status !== "blocked",
                      })
                    }
                  >
                    <ShieldBan
                      size={16}
                      className={
                        u.status === "blocked"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    />
                  </button>
                )}

                {/* Xóa: chỉ admin nhìn thấy */}
                {isAdmin && (
                  <button
                    className="px-2 py-1.5 rounded border text-sm hover:bg-rose-50 text-rose-600"
                    title="Xoá"
                    onClick={() => {
                      if (confirm("Xoá khách hàng này?")) delMut.mutate(u.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        );
      }),
    [list, isAdmin, blockMut.isLoading, delMut.isLoading]
  );

  return (
    <div>
      {/* Header + actions */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý khách hàng</h1>
        <button
          className="rounded-lg border px-3 py-2 text-sm flex items-center gap-2"
          onClick={() => qc.invalidateQueries({ queryKey: ["adminCustomers"] })}
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full rounded-lg border px-3 py-2 pr-9"
              placeholder="Tìm theo tên, email, SĐT…"
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

        <select
          className="rounded-lg border px-3 py-2 w-full md:w-56"
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

      {/* Bảng */}
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left">SĐT</th>
              <th className="px-3 py-2 text-left">Số đơn</th>
              <th className="px-3 py-2 text-left">Tổng chi</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Ngày tạo</th>
              <th className="px-3 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-8 text-center" colSpan={7}>
                  Đang tải…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-3 py-8 text-center text-rose-600" colSpan={7}>
                  Không tải được dữ liệu
                </td>
              </tr>
            ) : rows.length ? (
              rows
            ) : (
              <tr>
                <td className="px-3 py-8 text-center text-gray-500" colSpan={7}>
                  Chưa có khách hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
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

      {/* Modal xem/sửa */}
      <CustomerModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        initial={editing}
        // Admin mới được sửa các trường chính; Staff chỉ xem (và có thể chỉnh note nếu bạn muốn)
        onSave={(payload) => updateMut.mutate({ id: editing?.id, payload })}
        canEdit={isAdmin}
      />
      <CustomerOrdersPanel
        open={openHistory}
        onClose={() => {
          setOpenHistory(false);
          setViewing(null);
        }}
        customer={viewing}
      />
    </div>
  );
}
