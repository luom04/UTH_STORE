// src/Features/Account/components/AddressCard.jsx (Thiết kế hiện đại)

export default function AddressCard({ addr, onEdit, onDelete, onSetDefault }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-lg p-5 transition duration-300 hover:shadow-xl hover:border-blue-200/80">
      {/* --- 1. Thông tin người nhận và trạng thái --- */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
        <div>
          <div className="font-bold text-lg text-gray-900">{addr.fullname}</div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">SĐT:</span> {addr.phone}
          </div>
        </div>

        {/* Badge Mặc định */}
        {addr.isDefault ? (
          <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-700 font-semibold tracking-wide border border-green-300">
            MẶC ĐỊNH
          </span>
        ) : null}
      </div>

      {/* --- 2. Địa chỉ chi tiết --- */}
      <div className="text-sm text-gray-700 space-y-1">
        <p className="font-medium text-gray-900">{addr.address}</p>
        <p className="text-gray-600">
          {addr.ward?.name}, {addr.district?.name}, {addr.province?.name}
        </p>
      </div>

      {/* --- 3. Hành động (CTA) --- */}
      <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100">
        {/* Nút Sửa (Primary action) */}
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Sửa
        </button>

        {/* Nút Xoá (Secondary/Danger action) */}
        <button
          onClick={onDelete}
          className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
        >
          Xoá
        </button>

        {/* Nút Đặt làm mặc định (Tertiary action) */}
        {!addr.isDefault && (
          <button
            onClick={onSetDefault}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Đặt làm mặc định
          </button>
        )}
      </div>
    </div>
  );
}
