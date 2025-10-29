// src/Features/Admin/components/OrderRowActions.jsx
import { Printer, CheckCircle, Package } from "lucide-react";

export default function OrderRowActions({
  onPrint,
  onConfirm,
  onAdvance,
  canConfirm,
  canAdvance,
}) {
  return (
    <div className="flex items-center gap-2">
      {canConfirm && (
        <button
          onClick={onConfirm}
          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
        >
          <CheckCircle size={14} /> Xác nhận
        </button>
      )}
      {canAdvance && (
        <button
          onClick={onAdvance}
          className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
        >
          <Package size={14} /> Cập nhật
        </button>
      )}
      <button
        onClick={onPrint}
        className="px-2 py-1 text-xs rounded border inline-flex items-center gap-1"
      >
        <Printer size={14} /> In
      </button>
    </div>
  );
}
