// src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cartApi";
import toast from "react-hot-toast";

export function useCart() {
  const queryClient = useQueryClient();

  // ✅ GET CART
  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
    select: (response) => {
      // Backend có thể trả { data: {...} } hoặc object cart trực tiếp
      const raw = response?.data || response || {};

      const items = (raw.items || []).map((it) => ({
        ...it,
        studentDiscountAmount: Number(it.studentDiscountAmount || 0),
      }));
      // ✅ Tổng số lượng sản phẩm trong giỏ (cộng qty)
      const itemCount = items.reduce((sum, item) => sum + (item.qty || 0), 0);

      // ✅ Tạm tính (ưu tiên dùng từ BE, không có thì tự tính)
      const itemsTotal =
        typeof raw.itemsTotal === "number"
          ? raw.itemsTotal
          : items.reduce(
              (sum, item) => sum + (item.price || 0) * (item.qty || 0),
              0
            );

      const shippingFee =
        typeof raw.shippingFee === "number" ? raw.shippingFee : 0;

      // ✅ Tổng cộng
      const grandTotal =
        typeof raw.grandTotal === "number"
          ? raw.grandTotal
          : itemsTotal + shippingFee;

      return {
        ...raw,
        items,
        itemCount,
        itemsTotal,
        shippingFee,
        grandTotal,
      };
    },
    retry: 1,
  });

  // ✅ ADD ITEM
  const addMutation = useMutation({
    mutationFn: ({ productId, qty, options }) =>
      cartApi.addItem(productId, qty, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã thêm vào giỏ hàng!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;

      if (message?.includes("Not enough stock")) {
        toast.error(" Không đủ hàng trong kho");
      } else if (message?.includes("Product not found")) {
        toast.error(" Sản phẩm không tồn tại");
      } else {
        toast.error(message || "Thêm vào giỏ hàng thất bại");
      }
    },
  });

  // ✅ UPDATE QTY
  const updateMutation = useMutation({
    mutationFn: ({ itemId, qty }) => cartApi.updateItem(itemId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;

      if (message?.includes("Not enough stock")) {
        toast.error(" Không đủ hàng trong kho");
      } else {
        toast.error(message || "Cập nhật thất bại");
      }
    },
  });

  // ✅ REMOVE ITEM
  const removeMutation = useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(" Đã xóa khỏi giỏ hàng");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    },
  });

  // ✅ CLEAR CART
  const clearMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(" Đã xóa toàn bộ giỏ hàng");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    },
  });

  return {
    // Data
    cart: data || {
      items: [],
      itemsTotal: 0,
      shippingFee: 0,
      grandTotal: 0,
      itemCount: 0, // fallback khi chưa load xong
    },
    isLoading,
    error,

    // Mutations
    addToCart: addMutation.mutate,
    isAdding: addMutation.isPending,

    updateQty: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    removeItem: removeMutation.mutate,
    isRemoving: removeMutation.isPending,

    clearCart: clearMutation.mutate,
    isClearing: clearMutation.isPending,
  };
}
