import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const LS_KEY = "uth_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    // 1. Dùng _id của product làm id cho giỏ hàng
    const productId = product._id || product.id;

    setItems((prev) => {
      // 2. Tìm item bằng productId đã chuẩn hóa
      const idx = prev.findIndex((x) => x.id === productId);

      if (idx >= 0) {
        // Cập nhật số lượng (logic này đã đúng)
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }

      // 3. Khi thêm item mới, hãy "map" trường cho đúng
      return [
        ...prev,
        {
          id: productId, // Dùng _id hoặc id
          title: product.title,
          image: product.images?.[0] || product.images || "", // Lấy ảnh đầu tiên
          price: product.priceSale || product.price, // Ưu tiên giá sale
          oldPrice: product.priceSale ? product.price : product.oldPrice, // Giá cũ là giá gốc nếu có sale
          qty,
        },
      ];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x))
    );
  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((s, it) => s + it.price * it.qty, 0),
    [items]
  );

  const value = {
    items,
    add,
    remove,
    setQty,
    clear,
    total,
    count: items.length,
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartCtx);
