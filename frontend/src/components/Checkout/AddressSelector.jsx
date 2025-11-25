// src/components/Checkout/AddressSelector.jsx (Mới)
import React from "react";
import useAddresses from "../../hooks/useAddresses";
import { MapPin } from "lucide-react";

/**
 * Component hiển thị danh sách địa chỉ đã lưu để người dùng chọn.
 * @param {object} props
 * @param {string} props.selectedId - ID của địa chỉ đang được chọn.
 * @param {function} props.onSelect - Callback khi người dùng chọn một địa chỉ mới (nhận vào address object).
 */
export default function AddressSelector({ selectedId, onSelect }) {
  const { list, loading } = useAddresses();

  if (loading) {
    return <div className="text-sm text-gray-500">Đang tải địa chỉ...</div>;
  }

  // Lọc ra các địa chỉ hợp lệ (đã có đủ tỉnh/quận/phường)
  const validAddresses = list.filter((a) => a.province && a.district);

  if (validAddresses.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Chưa có địa chỉ nào được lưu.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-700">
        Chọn địa chỉ đã lưu:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {validAddresses.map((address) => {
          const isSelected = selectedId === address.id;
          return (
            <div
              key={address.id}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-200"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
              onClick={() => onSelect(address)}
            >
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className={
                    isSelected
                      ? "text-blue-600 shrink-0 mt-0.5"
                      : "text-gray-500 shrink-0 mt-0.5"
                  }
                />
                <div className="text-sm">
                  <p
                    className={`font-semibold ${
                      isSelected ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {address.fullname} - {address.phone}
                    {address.isDefault && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                        Mặc định
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {address.address}, {address.ward?.name},{" "}
                    {address.district?.name}, {address.province?.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
