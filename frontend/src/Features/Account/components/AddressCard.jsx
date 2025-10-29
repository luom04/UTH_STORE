// src/Features/Account/components/AddressCard.jsx
export default function AddressCard({ addr, onEdit, onDelete, onSetDefault }) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{addr.fullname}</div>
          <div className="text-sm text-gray-600">{addr.phone}</div>
        </div>
        {addr.isDefault ? (
          <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
            Mặc định
          </span>
        ) : null}
      </div>

      <div className="text-sm">
        {addr.address}, {addr.ward?.name}, {addr.district?.name},{" "}
        {addr.province?.name}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
        >
          Sửa
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
        >
          Xoá
        </button>
        {!addr.isDefault && (
          <button
            onClick={onSetDefault}
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
          >
            Đặt làm mặc định
          </button>
        )}
      </div>
    </div>
  );
}
