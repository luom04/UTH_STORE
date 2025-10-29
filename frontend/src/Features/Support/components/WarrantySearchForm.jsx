// src/Features/Support/components/WarrantySearchForm.jsx
import { useState } from "react";

export default function WarrantySearchForm() {
  const [mode, setMode] = useState("ticket"); // 'ticket' | 'imei'
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    // TODO: thay bằng React Query gọi API tra cứu
    console.log({ mode, phone, code });
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 border-b px-3 pt-3">
        <button
          className={`px-3 py-2 text-sm rounded-t-lg ${
            mode === "ticket"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => setMode("ticket")}
        >
          Tra cứu phiếu bảo hành
        </button>
        <button
          className={`px-3 py-2 text-sm rounded-t-lg ${
            mode === "imei"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => setMode("imei")}
        >
          Tra cứu IMEI
        </button>
      </div>

      <form
        onSubmit={onSearch}
        className="grid gap-3 px-3 py-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 w-full rounded-lg border px-3 text-sm"
          placeholder="Số điện thoại"
          required
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-10 w-full rounded-lg border px-3 text-sm"
          placeholder={
            mode === "ticket" ? "Mã phiếu bảo hành" : "IMEI / Serial"
          }
          required
        />
        <button
          type="submit"
          className="h-10 rounded-lg bg-blue-600 px-5 text-white text-sm font-medium hover:bg-blue-700"
        >
          Tra cứu
        </button>
      </form>
    </div>
  );
}
