// src/pages/Cart/Cart.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/Cart/CartContext";
import { Minus, Plus, Trash2, ChevronLeft } from "lucide-react";
import { PATHS } from "../../routes/paths";

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} /> Mua thêm sản phẩm khác
        </Link>
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold">Giỏ hàng của bạn đang trống</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-white hover:bg-red-700"
          >
            Về Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ChevronLeft size={16} /> Mua thêm sản phẩm khác
      </Link>

      <div className="mt-4 rounded-xl bg-white shadow-sm">
        {/* step mini */}
        <div className="grid grid-cols-4 text-center text-sm">
          <div className="py-4 font-semibold text-red-600 border-b-2 border-red-600">
            Giỏ hàng
          </div>
          <div className="py-4 text-gray-400">Thông tin đặt hàng</div>
          <div className="py-4 text-gray-400">Thanh toán</div>
          <div className="py-4 text-gray-400">Hoàn tất</div>
        </div>

        {/* list */}
        <div className="p-4 divide-y">
          {items.map((it) => (
            <div key={it.id} className="py-4 flex gap-4 items-center">
              <img
                src={it.image}
                alt={it.title}
                className="w-24 h-24 object-cover rounded-md bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium line-clamp-2">{it.title}</div>
                <button
                  className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
                  onClick={() => remove(it.id)}
                >
                  <Trash2 size={14} /> Xoá
                </button>
              </div>

              <div className="hidden sm:block w-32 text-right">
                {it.oldPrice && it.oldPrice > it.price && (
                  <div className="text-xs text-gray-400 line-through">
                    {it.oldPrice.toLocaleString()}đ
                  </div>
                )}
                <div className="font-semibold text-red-600">
                  {it.price.toLocaleString()}đ
                </div>
              </div>

              {/* qty */}
              <div className="flex items-center gap-2">
                <button
                  className="grid h-8 w-8 place-items-center rounded border"
                  onClick={() => setQty(it.id, it.qty - 1)}
                >
                  <Minus size={14} />
                </button>
                <input
                  className="h-8 w-12 rounded border text-center"
                  value={it.qty}
                  onChange={(e) =>
                    setQty(it.id, Number.parseInt(e.target.value) || 1)
                  }
                />
                <button
                  className="grid h-8 w-8 place-items-center rounded border"
                  onClick={() => setQty(it.id, it.qty + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* total + CTA */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-lg">
            <span className="text-gray-600">Tổng tiền:&nbsp;</span>
            <span className="font-bold text-red-600">
              {total.toLocaleString()}đ
            </span>
          </div>

          <button
            onClick={() => navigate(PATHS.CHECKOUT_INFO)}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            ĐẶT HÀNG NGAY
          </button>
        </div>
      </div>
    </div>
  );
}
