// src/components/Checkout/AddressSelect.jsx
import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function AddressSelect({ value, onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const provinceCode = value?.province?.code || "";
  const districtCode = value?.district?.code || "";
  const wardCode = value?.ward?.code || "";

  // provinces
  useEffect(() => {
    fetch(`${API}/p/`)
      .then((r) => r.json())
      .then((data) => setProvinces(data))
      .catch(() => setProvinces([]));
  }, []);

  // districts when province changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    fetch(`${API}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => {
        setDistricts(data?.districts || []);
        setWards([]);
      });
  }, [provinceCode]);

  // wards when district changes
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    fetch(`${API}/d/${districtCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data?.wards || []));
  }, [districtCode]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Province */}
      <select
        className="w-full rounded-lg border px-3 py-2"
        value={provinceCode}
        onChange={(e) => {
          const p = provinces.find((x) => String(x.code) === e.target.value);
          onChange?.({
            province: p || null,
            district: null,
            ward: null,
            address: value?.address || "",
          });
        }}
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
        onChange={(e) => {
          const d = districts.find((x) => String(x.code) === e.target.value);
          onChange?.({ ...value, district: d || null, ward: null });
        }}
        disabled={!provinceCode}
      >
        <option value="">
          {provinceCode ? "Chọn Quận, Huyện" : "Chọn Tỉnh trước"}
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
        onChange={(e) => {
          const w = wards.find((x) => String(x.code) === e.target.value);
          onChange?.({ ...value, ward: w || null });
        }}
        disabled={!districtCode}
      >
        <option value="">
          {districtCode ? "Chọn Phường, Xã" : "Chọn Quận trước"}
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
