// src/Features/Admin/pages/DashboardAdmin.jsx
import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useDashboardStats,
  useSaveDashboardNote,
  useUpdateDashboardNote,
  useDeleteDashboardNote,
} from "../../../hooks/useDashboard";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Package,
  MessageSquare,
  UserCog,
  BarChart2,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  // Icon cho Note
  Send,
  Edit2,
  Trash2,
  X,
  StickyNote,
} from "lucide-react";
import DashboardChart from "../components/DashboardChart";

// --- Sub-Component: Stat Card ---
function StatCard({ title, value, icon: Icon, colorClass, trend, footer }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}
        >
          <Icon className={`h-6 w-6 ${colorClass.replace("bg-", "text-")}`} />
        </div>
      </div>

      <div className="mt-4 flex items-center text-sm">
        {trend && (
          <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={14} className="mr-1" /> {trend}
          </span>
        )}
        {footer && (
          <span className="text-gray-400 font-medium text-xs flex items-center gap-1">
            {footer}
          </span>
        )}
      </div>

      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${colorClass} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}
      ></div>
    </div>
  );
}

// --- Sub-Component: Quick Action Button ---
function QuickAction({ to, icon: Icon, label, color, description }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-start justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:bg-blue-50/30"
    >
      <div
        className={`mb-3 rounded-lg p-2.5 ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}
      >
        <Icon size={22} className={color.replace("bg-", "text-")} />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
          {label}
        </h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{description}</p>
      </div>
    </Link>
  );
}

// --- Sub-Component: Recent Orders ---
function RecentOrdersTable({ orders = [] }) {
  const statusConfig = {
    pending: {
      label: "Chờ xử lý",
      class: "bg-amber-50 text-amber-700 border-amber-100",
      icon: Clock,
    },
    confirmed: {
      label: "Đã xác nhận",
      class: "bg-blue-50 text-blue-700 border-blue-100",
      icon: CheckCircle2,
    },
    shipping: {
      label: "Đang giao",
      class: "bg-indigo-50 text-indigo-700 border-indigo-100",
      icon: Package,
    },
    completed: {
      label: "Hoàn thành",
      class: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle2,
    },
    canceled: {
      label: "Đã hủy",
      class: "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
    },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900">Đơn hàng mới</h3>
          <p className="text-xs text-gray-500 mt-0.5">5 đơn hàng gần nhất</p>
        </div>
        <Link
          to="/admin/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Tất cả <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Mã đơn</th>
              <th className="px-6 py-3">Khách hàng</th>
              <th className="px-6 py-3 text-right">Tổng tiền</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <tr
                  key={order._id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="hover:text-blue-600 font-mono"
                    >
                      #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {order.user?.name?.charAt(0).toUpperCase() || "K"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {order.user?.name || "Khách lẻ"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {order.grandTotal?.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusConfig[order.status]?.class || "bg-gray-100"
                      }`}
                    >
                      <StatusIcon size={12} />
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function DashboardAdmin() {
  const { user } = useAuth();
  const isAdmin = String(user?.role).toLowerCase() === "admin";

  const { data, isLoading, isError } = useDashboardStats();

  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

  const saveNoteMut = useSaveDashboardNote();
  const updateNoteMut = useUpdateDashboardNote();
  const deleteNoteMut = useDeleteDashboardNote();

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Logic Submit Note
  const handleSubmitNote = () => {
    if (!noteContent.trim()) return;

    if (editingNoteId) {
      updateNoteMut.mutate(
        { noteId: editingNoteId, content: noteContent },
        {
          onSuccess: () => {
            setNoteContent("");
            setEditingNoteId(null);
          },
        }
      );
    } else {
      saveNoteMut.mutate(noteContent, {
        onSuccess: () => {
          setNoteContent("");
        },
      });
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setNoteContent(note.content);
  };

  const handleDeleteNote = (noteId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ghi chú này?")) return;
    deleteNoteMut.mutate(noteId, {
      onSuccess: () => {
        if (editingNoteId === noteId) {
          setEditingNoteId(null);
          setNoteContent("");
        }
      },
    });
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
        Lỗi kết nối server.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      {/* 1. Header Section - ✅ Đã Xóa Search & Bell */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
            <Calendar size={16} /> {today}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Chào,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {user?.name}
            </span>{" "}
            👋
          </h1>
          <p className="text-gray-500 mt-1">
            Đây là báo cáo tổng quan tình hình kinh doanh hôm nay.
          </p>
        </div>
      </div>

      {/* 2. KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu hôm nay"
          value={`${data?.revenue?.today?.toLocaleString()}đ`}
          icon={DollarSign}
          colorClass="bg-emerald-500"
          trend="Hôm nay"
          footer="Doanh thu thực tế"
        />
        <StatCard
          title="Đơn chờ xử lý"
          value={data?.orders?.pending}
          icon={Clock}
          colorClass="bg-amber-500"
          footer="Cần admin duyệt gấp"
        />
        <StatCard
          title="Tổng khách hàng"
          value={data?.customers?.total}
          icon={Users}
          colorClass="bg-blue-500"
          footer="Khách hàng đã đăng ký"
        />
        <StatCard
          title="Sắp hết hàng"
          value={data?.products?.lowStock}
          icon={AlertCircle}
          colorClass="bg-rose-500"
          footer="Tồn kho dưới 5 sản phẩm"
        />
      </div>

      {/* 3. Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 size={20} className="text-indigo-600" />
              Biểu đồ doanh thu
            </h3>
            <select className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option>7 ngày qua</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <DashboardChart data={data?.chart} />
          </div>
        </div>

        {/* Quick Actions & Notes */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Truy cập nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction
                to="/admin/orders"
                icon={ShoppingBag}
                label="Đơn hàng"
                color="bg-blue-500"
                description="Quản lý đơn mua"
              />
              <QuickAction
                to="/admin/products"
                icon={Package}
                label="Sản phẩm"
                color="bg-indigo-500"
                description="Kho hàng hóa"
              />
              <QuickAction
                to="/admin/reviews"
                icon={MessageSquare}
                label="Đánh giá"
                color="bg-amber-500"
                description="Review SP"
              />
              {isAdmin ? (
                <QuickAction
                  to="/admin/staffs"
                  icon={UserCog}
                  label="Nhân viên"
                  color="bg-purple-500"
                  description="Quản trị HR"
                />
              ) : (
                <QuickAction
                  to="/admin/customers"
                  icon={Users}
                  label="Khách hàng"
                  color="bg-emerald-500"
                  description="DS người dùng"
                />
              )}
            </div>
          </div>

          {/* ✅ NOTE BOX DESIGN MỚI */}
          <div className="flex-1 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col border border-white/10">
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                <StickyNote size={18} className="text-white/80" /> Ghi chú nội
                bộ
              </h3>
              {editingNoteId && (
                <button
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteContent("");
                  }}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs text-white/90 flex items-center gap-1 transition-colors"
                >
                  <X size={12} /> Hủy sửa
                </button>
              )}
            </div>

            {/* Input Area */}
            <div className="relative z-10 mb-4 group">
              <div className="relative">
                <textarea
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 pr-12 text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 resize-none transition-all shadow-inner"
                  rows={2}
                  placeholder="Nhập ghi chú mới..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSubmitNote}
                  disabled={
                    !noteContent.trim() ||
                    saveNoteMut.isPending ||
                    updateNoteMut.isPending
                  }
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                  title={editingNoteId ? "Lưu lại" : "Gửi"}
                >
                  {saveNoteMut.isPending || updateNoteMut.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingNoteId ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Note List */}
            <div className="relative z-10 flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {(data?.notes || []).length === 0 && (
                <div className="text-center py-6 text-white/50 text-xs">
                  Chưa có ghi chú nào.
                </div>
              )}

              {(data?.notes || []).map((note) => {
                return (
                  <div
                    key={note._id}
                    className={`group relative flex gap-3 p-3 rounded-xl transition-all border border-transparent hover:border-white/10 hover:bg-white/5 ${
                      editingNoteId === note._id
                        ? "bg-white/10 ring-1 ring-white/30"
                        : "bg-white/10"
                    }`}
                  >
                    {/* Avatar Initials */}
                    <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-sm">
                      {note.author?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white/90 truncate">
                          {note.author?.name || "Người dùng ẩn"}
                        </span>
                        <span className="text-[10px] text-white/50">
                          {new Date(note.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed break-words whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>

                    {/* Action Buttons (Hover to show) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1.5 rounded-md bg-white/20 hover:bg-white text-white hover:text-indigo-600 transition-colors shadow-sm"
                        title="Sửa"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        disabled={deleteNoteMut.isPending}
                        className="p-1.5 rounded-md bg-white/20 hover:bg-rose-500 text-white transition-colors shadow-sm"
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-purple-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Orders */}
      <div className="grid grid-cols-1">
        <RecentOrdersTable orders={data?.recentOrders} />
      </div>
    </div>
  );
}
