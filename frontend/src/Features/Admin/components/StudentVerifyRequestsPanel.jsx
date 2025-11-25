import { useState } from "react";
import { GraduationCap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentVerifyRequestsPanel({
  pendingList = [],
  isLoading = false,
  isProcessing = false,
  onApprove,
  onReject,
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  const openReject = (userId) => {
    setRejectingId(userId);
    setReason("");
  };

  const submitReject = () => {
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do từ chối");
    onReject?.(rejectingId, reason.trim());
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap size={18} className="text-blue-600" />
          Yêu cầu xác thực sinh viên
        </h2>

        <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
          {pendingList.length} đang chờ
        </span>
      </div>

      {isLoading ? (
        <div className="py-6 grid place-items-center text-gray-500 text-sm">
          <Loader2 className="animate-spin mr-2" size={16} />
          Đang tải yêu cầu...
        </div>
      ) : pendingList.length === 0 ? (
        <p className="text-sm text-gray-500 py-3">
          Hiện không có yêu cầu xác thực nào.
        </p>
      ) : (
        <div className="space-y-3">
          {pendingList.map((u) => {
            const info = u.studentInfo || {};
            return (
              <div
                key={u.id}
                className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition flex flex-col md:flex-row gap-3 md:items-center"
              >
                {/* Ảnh thẻ */}
                <div className="w-full md:w-40 h-28 bg-white border rounded-lg overflow-hidden grid place-items-center">
                  {info.studentIdImage ? (
                    <img
                      src={info.studentIdImage}
                      alt="student card"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Không có ảnh</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {u.displayName || u.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {u.email} • {info.schoolName || "Chưa có trường"}
                  </div>
                  {info.submittedAt && (
                    <div className="text-[11px] text-gray-400 mt-1">
                      Gửi lúc:{" "}
                      {new Date(info.submittedAt).toLocaleString("vi-VN")}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end md:justify-start">
                  <button
                    onClick={() => onApprove?.(u)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    Duyệt
                  </button>

                  <button
                    onClick={() => openReject(u.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Từ chối
                  </button>
                </div>

                {/* Reject box inline */}
                {rejectingId === u.id && (
                  <div className="w-full mt-2">
                    <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                      <label className="text-xs font-semibold text-rose-700">
                        Lý do từ chối
                      </label>
                      <textarea
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-rose-200 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                        placeholder="VD: Ảnh mờ / Thiếu thông tin / Không đúng trường..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 hover:bg-gray-50"
                          disabled={isProcessing}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={submitReject}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                          {isProcessing ? "Đang xử lý..." : "Xác nhận từ chối"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
