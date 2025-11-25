import { useEffect, useState } from "react";
// ✅ Import các hook
import {
  useCustomerOrders,
  useCustomerDetails,
  useAddCustomerNote,
} from "../../../hooks/useCustomers";

// ✅ Import đầy đủ Icons (Đã thêm ShieldCheck, ShieldAlert)
import {
  X,
  PackageOpen,
  StickyNote,
  Send,
  User,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Eye,
} from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge.jsx";
import OrderQuickViewModal from "./OrderQuickViewModal.jsx";

// --- Sub-Component: Tab Ghi chú ---
function CustomerNotesTab({ customerId }) {
  const [noteContent, setNoteContent] = useState("");

  const { data: customerData, isLoading } = useCustomerDetails(customerId);
  const { mutate: addNote, isLoading: isAdding } = useAddCustomerNote();

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addNote(
      { id: customerId, content: noteContent },
      { onSuccess: () => setNoteContent("") }
    );
  };

  const notes = customerData?.notes || [];

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải ghi chú...</div>
    );

  return (
    <div className="flex flex-col h-full">
      {/* Input Area */}
      <form onSubmit={handleAddNote} className="p-4 border-b bg-gray-50">
        <div className="relative">
          <textarea
            className="w-full rounded-lg border border-gray-300 p-3 pr-12 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            rows={3}
            placeholder="Nhập ghi chú về khách hàng..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddNote(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!noteContent.trim() || isAdding}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {notes.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
            <StickyNote size={40} className="mb-2 opacity-20" />
            <p className="text-sm">Chưa có ghi chú nào.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <p className="text-gray-800 text-sm whitespace-pre-wrap mb-2">
                {note.content}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span className="font-medium text-gray-600">
                    {note.author?.name || "Admin"}
                  </span>
                  <span className="bg-gray-100 px-1.5 rounded text-[10px] uppercase">
                    {note.author?.role || "Staff"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>
                    {new Date(note.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: Tab Lịch sử Đơn hàng ---
function OrderHistoryTab({ customerId, onQuickView = () => {} }) {
  const { data, isLoading, isError } = useCustomerOrders(customerId);
  const list = data?.data || [];
  // const navigate = useNavigate(); // Nếu bạn muốn click vào đơn để sang trang chi tiết

  // Hàm tính hạn bảo hành (Giả lập 12 tháng)
  const getWarrantyStatus = (orderDate) => {
    const purchaseDate = new Date(orderDate);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // +1 năm

    const now = new Date();
    const isValid = now < expiryDate;

    return {
      isValid,
      expiryDate: expiryDate.toLocaleDateString("vi-VN"),
      daysLeft: isValid
        ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
        : 0,
    };
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải lịch sử...</div>
    );
  if (isError)
    return (
      <div className="p-8 text-center text-rose-500">Lỗi tải dữ liệu.</div>
    );
  if (list.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <PackageOpen size={48} strokeWidth={1.5} className="mb-3 opacity-50" />
        <p>Khách hàng chưa có đơn hàng nào.</p>
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3">Mã đơn</th>
            <th className="px-4 py-3">Ngày đặt</th>
            <th className="px-4 py-3 text-center">Bảo hành (Est)</th>
            <th className="px-4 py-3 text-center">Trạng thái</th>
            <th className="px-6 py-3 text-right">Tổng tiền</th>
            <th className="px-4 py-3 text-center">Xem nhanh</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {list.map((o) => {
            const warranty = getWarrantyStatus(o.createdAt);

            return (
              <tr
                key={o._id || o.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-blue-600">
                  #{o.orderNumber || o._id.toString().slice(-6).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                </td>

                {/* Cột Bảo hành */}
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center">
                    {o.status === "completed" ? (
                      warranty.isValid ? (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
                          title={`Hết hạn: ${warranty.expiryDate}`}
                        >
                          <ShieldCheck size={12} /> {warranty.daysLeft} ngày
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                          title={`Hết hạn: ${warranty.expiryDate}`}
                        >
                          <ShieldAlert size={12} /> Hết hạn
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-6 py-3 text-right font-medium text-gray-900">
                  {(o.grandTotal || o.total || 0).toLocaleString()}đ
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onQuickView(o)}
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={14} />
                    Xem
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function CustomerOrdersPanel({ open, onClose, customer }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [quickOrder, setQuickOrder] = useState(null); // ✅ state modal

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setActiveTab("orders");
      setQuickOrder(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed inset-0 z-40 flex justify-end transition-all duration-300 ${
          open ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        <aside
          className={`relative h-full w-full max-w-4xl bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header Info */}
          <div className="flex items-start justify-between border-b px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                {customer?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {customer?.displayName || "Khách hàng"}
                </h2>
                <div className="flex flex-col text-sm text-gray-500">
                  <span>{customer?.email}</span>
                  <span className="text-xs text-gray-400">
                    {customer?.displayPhone || customer?.phone}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <PackageOpen size={16} />
              Lịch sử đơn hàng
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "notes"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <StickyNote size={16} />
              Ghi chú tư vấn (CRM)
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {customer && activeTab === "orders" && (
              <OrderHistoryTab
                customerId={customer.id}
                onQuickView={(o) => setQuickOrder(o)}
              />
            )}
            {customer && activeTab === "notes" && (
              <CustomerNotesTab customerId={customer.id} />
            )}
          </div>
        </aside>
      </div>

      {/* ✅ Modal xem nhanh dùng chung */}
      <OrderQuickViewModal
        open={!!quickOrder}
        order={quickOrder}
        onClose={() => setQuickOrder(null)}
        // Nếu bạn muốn in luôn từ panel này:
        // onPrint={() => printOrderInvoice(quickOrder)}
      />
    </>
  );
}
