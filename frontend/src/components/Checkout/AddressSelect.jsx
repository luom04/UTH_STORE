// src/components/Checkout/AddressSelect.jsx
import React, { useEffect, useState, useCallback } from "react";

// API base URL
const API = import.meta.env.VITE_API_URL;

/**
 * Hàm fetch chung có hỗ trợ AbortController
 */
const fetchData = async (url, signal) => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export default function AddressSelect({ value, onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Lấy code hiện tại từ props
  const provinceCode = value?.province?.code || "";
  const districtCode = value?.district?.code || "";
  const wardCode = value?.ward?.code || "";

  // 1. Tỉnh/Thành phố (Load một lần) - KHÔNG ĐỔI
  useEffect(() => {
    const controller = new AbortController();
    fetchData(`${API}/p/`, controller.signal)
      .then(setProvinces)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load provinces:", err);
          setProvinces([]);
        }
      });
    return () => controller.abort();
  }, []);

  // 2. Quận/Huyện khi Tỉnh thay đổi
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    const controller = new AbortController();
    setDistricts([]); // Clear districts cũ
    setWards([]); // Clear wards

    fetchData(`${API}/p/${provinceCode}?depth=2`, controller.signal)
      .then((data) => {
        const newDistricts = data?.districts || [];
        setDistricts(newDistricts);

        // Kiểm tra: Nếu mã quận cũ KHÔNG tồn tại trong danh sách mới, thì reset quận/phường
        const isValidDistrict = newDistricts.some(
          (d) => String(d.code) === districtCode
        );

        if (!isValidDistrict && districtCode) {
          // Chỉ reset khi DISTRICTCODE có giá trị nhưng không còn hợp lệ
          // và gọi onChange để cập nhật state cha (form)
          onChange?.({
            ...value,
            district: null,
            ward: null,
          });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load districts:", err);
        }
      });

    // 🔑 Dependencies chỉ nên là provinceCode để tránh lỗi vòng lặp/reset khi districtCode thay đổi
    return () => controller.abort();
  }, [provinceCode]); // <-- Đã xóa districtCode khỏi dependencies

  // 3. Phường/Xã khi Quận thay đổi
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      return;
    }

    const controller = new AbortController();
    setWards([]); // Clear wards cũ

    fetchData(`${API}/d/${districtCode}?depth=2`, controller.signal)
      .then((data) => {
        const newWards = data?.wards || [];
        setWards(newWards);

        // Kiểm tra: Nếu mã phường cũ KHÔNG tồn tại trong danh sách mới, thì reset phường
        const isValidWard = newWards.some((w) => String(w.code) === wardCode);

        if (!isValidWard && wardCode) {
          // Chỉ reset khi WARDCODE có giá trị nhưng không còn hợp lệ
          onChange?.({
            ...value,
            ward: null,
          });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load wards:", err);
        }
      });

    // 🔑 Dependencies chỉ nên là districtCode
    return () => controller.abort();
  }, [districtCode]); // <-- Đã xóa wardCode khỏi dependencies

  // Xử lý thay đổi tỉnh
  const handleProvinceChange = useCallback(
    (e) => {
      const p = provinces.find((x) => String(x.code) === e.target.value);
      // Khi chọn tỉnh mới, bắt buộc reset cả quận và phường
      onChange?.({
        province: p || null,
        district: null,
        ward: null,
        address: value?.address || "",
      });
    },
    [provinces, onChange, value?.address]
  );

  // Xử lý thay đổi quận
  const handleDistrictChange = useCallback(
    (e) => {
      const d = districts.find((x) => String(x.code) === e.target.value);
      // Khi chọn quận mới, bắt buộc reset phường
      onChange?.({ ...value, district: d || null, ward: null });
    },
    [districts, onChange, value]
  );

  // Xử lý thay đổi phường
  const handleWardChange = useCallback(
    (e) => {
      const w = wards.find((x) => String(x.code) === e.target.value);
      onChange?.({ ...value, ward: w || null });
    },
    [wards, onChange, value]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Province */}
      <select
        className="w-full rounded-lg border px-3 py-2"
        value={provinceCode}
        onChange={handleProvinceChange}
      >
        <option value="">Chọn Tỉnh, Thành phố</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      {/* District */}
      <select
        className="w-full rounded-lg border px-3 py-2"
        value={districtCode}
        onChange={handleDistrictChange}
        disabled={!provinceCode || districts.length === 0}
      >
        <option value="">
          {!provinceCode ? "Chọn Tỉnh trước" : "Chọn Quận, Huyện"}
        </option>
        {districts.map((d) => (
          <option key={d.code} value={d.code}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Ward */}
      <select
        className="w-full rounded-lg border px-3 py-2"
        value={wardCode}
        onChange={handleWardChange}
        disabled={!districtCode || wards.length === 0}
      >
        <option value="">
          {!districtCode ? "Chọn Quận trước" : "Chọn Phường, Xã"}
        </option>
        {wards.map((w) => (
          <option key={w.code} value={w.code}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
