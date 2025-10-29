// src/store/CartContext.jsx
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
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice,
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
