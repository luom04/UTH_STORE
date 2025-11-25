// src/Features/Admin/components/OrderRowActions.jsx
import { useState } from "react";
import { Printer, AlertTriangle } from "lucide-react";

// 1. Định nghĩa map cho hành động tiếp theo
const NEXT_ACTION_MAP = {
  pending: { nextStatus: "confirmed", label: "Xác nhận" },
  confirmed: { nextStatus: "shipping", label: "Giao hàng" },
  shipping: { nextStatus: "completed", label: "Hoàn thành" },
  // 'completed' và 'canceled' không có hành động tiếp theo
};

export default function OrderRowActions({
  onPrint,
  onChangeStatus, // (newStatus, note)
  currentStatus,
  disabled = false,
  orderId, // chưa dùng, để dành sau này
  cancelReason: orderCancelReason, // 🔥 nhận lý do hủy hiện tại
  canceledByType, // 🔥 nhận loại người hủy (customer/admin/system)
}) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [mode, setMode] = useState("cancel"); // "cancel" | "edit"

  const nextAction = NEXT_ACTION_MAP[currentStatus];

  // Có thể hủy (đổi trạng thái sang canceled)
  const canCancel = ["pending", "confirmed", "shipping"].includes(
    currentStatus
  );

  // Có thể sửa lý do nếu đơn đã canceled
  const canEditCancelReason =
    currentStatus === "canceled" && canceledByType !== "customer";

  const canceledByLabel =
    canceledByType === "customer"
      ? "Khách hàng"
      : canceledByType === "admin"
      ? "Store (Admin/Staff)"
      : canceledByType === "system"
      ? "Hệ thống"
      : "Không rõ";

  // Mở modal hủy / sửa lý do
  const openCancelModal = (modeType) => {
    setMode(modeType);
    if (modeType === "edit") {
      // Prefill lý do cũ khi sửa
      setReasonInput(orderCancelReason || "");
    } else {
      // Khi hủy mới thì để trống
      setReasonInput("");
    }
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setReasonInput("");
  };

  // Xác nhận (dùng cho cả hủy mới & sửa lý do)
  const handleConfirm = () => {
    if (!reasonInput.trim()) {
      // nếu không thích alert có thể bỏ, vì nút đã disabled khi trống
      alert("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }

    onChangeStatus?.("canceled", reasonInput.trim());
    closeCancelModal();
  };

  // Hành động tiếp theo (pending -> confirmed -> shipping -> completed)
  const handleNextAction = () => {
    if (!nextAction) return;
    onChangeStatus?.(nextAction.nextStatus, "");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Nút hành động chính (tiếp theo) */}
        {nextAction && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleNextAction}
            className="inline-flex items-center rounded border border-blue-600 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-100"
          >
            {nextAction.label}
          </button>
        )}

        {/* Nút Hủy (dùng khi đơn chưa bị hủy) */}
        {canCancel && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => openCancelModal("cancel")}
            className="inline-flex items-center rounded border px-2 py-1 text-xs text-gray-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Hủy
          </button>
        )}

        {/* Nút Sửa lý do (dùng khi đơn đã bị hủy) */}
        {canEditCancelReason && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => openCancelModal("edit")}
            className="inline-flex items-center rounded border px-2 py-1 text-xs text-gray-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Sửa lý do
          </button>
        )}

        {/* Nút in hóa đơn */}
        <button
          type="button"
          onClick={onPrint}
          className="px-2 py-1 text-xs rounded border inline-flex items-center gap-1 cursor-pointer hover:bg-gray-50"
        >
          <Printer size={14} />
        </button>
      </div>

      {/* ============================================== */}
      {/* Modal Hủy / Sửa lý do Hủy */}
      {/* ============================================== */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  {mode === "edit" ? "Chỉnh sửa lý do hủy" : "Hủy Đơn Hàng"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {mode === "edit"
                    ? "Cập nhật lại lý do hủy để ghi nhận chính xác hơn."
                    : "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ hoàn trả hàng về kho và không thể hoàn tác."}
                </p>

                {mode === "edit" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Hủy bởi:{" "}
                    <span className="font-medium">{canceledByLabel}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Form lý do */}
            <div className="mt-4">
              <label
                htmlFor="cancelReason"
                className="block text-sm font-medium text-gray-700"
              >
                {mode === "edit"
                  ? "Lý do hủy (có thể chỉnh sửa)"
                  : "Lý do hủy (bắt buộc)"}
              </label>
              <textarea
                id="cancelReason"
                rows={3}
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder={
                  mode === "edit"
                    ? "Cập nhật lại lý do hủy..."
                    : "VD: Khách hàng yêu cầu hủy, hết hàng..."
                }
              />
            </div>

            {/* Nút hành động của Modal */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!reasonInput.trim() || disabled}
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === "edit" ? "Lưu lý do" : "Xác nhận Hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
