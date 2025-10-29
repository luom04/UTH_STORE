// src/Features/Admin/components/products/ProductsTable.jsx
import { Minus, Plus as PlusIcon, Pencil, Trash2 } from "lucide-react";
import StockBadge from "./StockBadge.jsx";

export default function ProductsTable({
  isLoading,
  isError,
  list,
  meta,
  onEdit,
  onDelete,
  onInc,
  onDec,
  canDelete,
}) {
  const rows = (list || []).map((p) => (
    <tr key={p.id} className="border-b">
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <img
            src={
              p.image || "https://dummyimage.com/80x80/efefef/aaa&text=No+Image"
            }
            alt={p.title}
            className="w-12 h-12 rounded object-cover bg-gray-50"
          />
          <div className="min-w-0">
            <div className="font-medium line-clamp-1">{p.title}</div>
            <div className="text-xs text-gray-500 line-clamp-1">{p.slug}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2">{p.category || "-"}</td>
      <td className="px-3 py-2 font-semibold text-red-600">
        {p.price?.toLocaleString()}đ
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            className="grid h-7 w-7 place-items-center rounded border"
            onClick={() => onDec(p.id)}
            title="Giảm 1"
          >
            <Minus size={14} />
          </button>
          <div className="w-10 text-center">{p.stock}</div>
          <button
            className="grid h-7 w-7 place-items-center rounded border"
            onClick={() => onInc(p.id)}
            title="Tăng 1"
          >
            <PlusIcon size={14} />
          </button>
        </div>
      </td>
      <td className="px-3 py-2">
        <StockBadge stock={p.stock} />
      </td>
      <td className="px-3 py-2 text-sm text-gray-500">
        {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1.5 rounded border text-sm hover:bg-gray-50"
            onClick={() => onEdit(p)}
            title="Sửa"
          >
            <Pencil size={16} />
          </button>

          {canDelete && (
            <button
              className="px-2 py-1.5 rounded border text-sm hover:bg-rose-50 text-rose-600"
              onClick={() => onDelete(p.id)}
              title="Xoá"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  ));

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="min-w-[980px] w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            <th className="px-3 py-2 text-left">Sản phẩm</th>
            <th className="px-3 py-2 text-left">Danh mục</th>
            <th className="px-3 py-2 text-left">Giá</th>
            <th className="px-3 py-2 text-left">Kho</th>
            <th className="px-3 py-2 text-left">Trạng thái</th>
            <th className="px-3 py-2 text-left">Cập nhật</th>
            <th className="px-3 py-2 text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td className="px-3 py-8 text-center" colSpan={7}>
                Đang tải…
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td className="px-3 py-8 text-center text-rose-600" colSpan={7}>
                Không tải được dữ liệu
              </td>
            </tr>
          ) : rows.length ? (
            rows
          ) : (
            <tr>
              <td className="px-3 py-8 text-center text-gray-500" colSpan={7}>
                Chưa có sản phẩm
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
