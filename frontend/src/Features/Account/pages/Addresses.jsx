// src/Features/Account/pages/Addresses.jsx
import { useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import AddressCard from "../components/AddressCard.jsx";
import AddressSelect from "../../../components/Checkout/AddressSelect.jsx";
import useAddresses from "../../../hooks/useAddresses.js";

export default function Addresses() {
  const { list, loading, error, add, update, remove, setDefault } =
    useAddresses();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    id: null,
    fullname: "",
    phone: "",
    address: "",
    province: null,
    district: null,
    ward: null,
    isDefault: false,
  });

  const startCreate = () => {
    setDraft({
      id: null,
      fullname: "",
      phone: "",
      address: "",
      province: null,
      district: null,
      ward: null,
      isDefault: list.length === 0, // cái đầu tiên mặc định
    });
    setOpen(true);
  };

  const startEdit = (a) => {
    setDraft(a);
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!draft.fullname || !draft.phone || !draft.address || !draft.ward) {
      alert("Vui lòng nhập đủ thông tin & chọn Tỉnh/Quận/Phường.");
      return;
    }
    try {
      if (draft.id) {
        await update(draft.id, draft);
      } else {
        await add(draft);
      }
      setOpen(false);
    } catch (err) {
      alert(err?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Sổ địa chỉ</h1>
        <button
          onClick={startCreate}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm"
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !list.length ? (
        <EmptyState
          title="Chưa có địa chỉ"
          desc="Hãy thêm địa chỉ giao hàng để thanh toán nhanh chóng hơn."
          action={
            <button
              onClick={startCreate}
              className="rounded-lg bg-blue-600 text-white px-4 py-2"
            >
              Thêm địa chỉ
            </button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((a) => (
            <AddressCard
              key={a.id}
              addr={a}
              onEdit={() => startEdit(a)}
              onDelete={() => remove(a.id)}
              onSetDefault={() => setDefault(a.id)}
            />
          ))}
        </div>
      )}

      {/* Modal thêm/sửa */}
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <form
            onSubmit={onSave}
            className="w-full max-w-xl rounded-xl bg-white p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold">
              {draft.id ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Họ tên"
                value={draft.fullname}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, fullname: e.target.value }))
                }
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Số điện thoại"
                value={draft.phone}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </div>

            <AddressSelect
              value={draft}
              onChange={(addr) =>
                setDraft((d) => ({
                  ...d,
                  province: addr.province,
                  district: addr.district,
                  ward: addr.ward,
                }))
              }
            />

            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Số nhà, tên đường"
              value={draft.address}
              onChange={(e) =>
                setDraft((d) => ({ ...d, address: e.target.value }))
              }
            />

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!draft.isDefault}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, isDefault: e.target.checked }))
                  }
                />
                Đặt làm mặc định
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
