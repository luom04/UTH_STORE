import OrderStatusBadge from "./OrderStatusBadge.jsx";

// helper format tiền
const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

// helper dựng địa chỉ
const buildAddress = (shippingAddress) => {
  if (!shippingAddress) return "Khách nhận tại cửa hàng / chưa có địa chỉ";
  const arr = [
    shippingAddress.line1,
    shippingAddress.ward,
    shippingAddress.district,
    shippingAddress.city,
  ].filter(Boolean);
  return arr.join(", ") || "Khách nhận tại cửa hàng / chưa có địa chỉ";
};

/**
 * Modal xem nhanh đơn hàng (dùng chung Admin OrdersPage + CustomerOrdersPanel)
 */
export default function OrderQuickViewModal({
  open,
  order,
  onClose,
  onPrint,
  title = "Xem nhanh đơn hàng",
}) {
  if (!open || !order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-lg overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">
              Mã đơn:{" "}
              <span className="font-medium text-gray-700">
                {order.orderNumber || order._id}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>

        {/* body */}
        <div className="p-4 space-y-4">
          {/* customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500 mb-1">
                Thông tin khách hàng
              </div>
              <div className="font-medium">
                {order.shippingAddress?.fullName || order.user?.name || "-"}
              </div>
              <div className="text-gray-600">
                SĐT: {order.shippingAddress?.phone || order.user?.phone || "-"}
              </div>
              <div className="text-gray-600 mt-1">
                Địa chỉ: {buildAddress(order.shippingAddress)}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500 mb-1">
                Trạng thái & thanh toán
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-gray-600 text-xs">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("vi-VN")
                    : ""}
                </span>
              </div>
              <div className="text-gray-600 mt-2">
                Thanh toán:{" "}
                <span className="font-medium">
                  {String(order.paymentMethod || "cod").toUpperCase()}
                </span>
              </div>
              {order.note && (
                <div className="text-gray-600 mt-1">Ghi chú: {order.note}</div>
              )}
              {order.status === "canceled" && order.cancelReason && (
                <div className="mt-2 text-rose-700 text-xs bg-rose-50 border border-rose-100 rounded p-2">
                  <b>Lý do hủy:</b> {order.cancelReason}
                </div>
              )}
            </div>
          </div>

          {/* items */}
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Danh sách sản phẩm
            </div>
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Sản phẩm</th>
                    <th className="px-3 py-2 text-center w-16">SL</th>
                    <th className="px-3 py-2 text-right w-36">Đơn giá</th>
                    <th className="px-3 py-2 text-right w-36">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const original = Number(it.originalPrice ?? it.price ?? 0);
                    const afterStudent = Number(it.price ?? 0);
                    const subtotal = Number(
                      it.subtotal ?? afterStudent * (it.qty || 0)
                    );
                    const hasStudentDiscount =
                      Number(it.studentDiscountPerUnit || 0) > 0;

                    return (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                it.image ||
                                "https://placehold.co/40x40?text=NoImg"
                              }
                              className="h-10 w-10 rounded-md object-cover border bg-white"
                              alt={it.title}
                            />
                            <div className="min-w-0">
                              <div className="line-clamp-1 font-medium text-gray-900">
                                {it.title}
                              </div>

                              {hasStudentDiscount && (
                                <div className="text-xs text-emerald-600">
                                  HSSV: -{formatVND(it.studentDiscountPerUnit)}{" "}
                                  / sp
                                </div>
                              )}

                              {it.options?.note && (
                                <div className="text-xs text-gray-500">
                                  {it.options.note}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-2 text-center">{it.qty || 0}</td>

                        <td className="px-3 py-2 text-right">
                          {/* Đơn giá thực tế = giá trước HSSV */}
                          <div className="font-medium">
                            {formatVND(original)}
                          </div>
                          {hasStudentDiscount && (
                            <div className="text-xs text-gray-500">
                              Sau HSSV: {formatVND(afterStudent)}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-2 text-right font-semibold">
                          {formatVND(subtotal)}
                        </td>
                      </tr>
                    );
                  })}

                  {!items.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-6 text-center text-gray-400"
                      >
                        Đơn hàng không có sản phẩm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền hàng:</span>
                <span>{formatVND(order.itemsTotal)}</span>
              </div>

              {Number(order.studentDiscountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Giảm HSSV:</span>
                  <span>-{formatVND(order.studentDiscountAmount)}</span>
                </div>
              )}

              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Voucher {order.couponCode}:</span>
                  <span>-{formatVND(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>
                  {Number(order.shippingFee || 0) === 0
                    ? "Miễn phí"
                    : formatVND(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold text-gray-900">Thành tiền:</span>
                <span className="font-bold text-red-600 text-lg">
                  {formatVND(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="border-t px-4 py-3 flex justify-end gap-2 bg-gray-50">
          {onPrint && (
            <button
              onClick={onPrint}
              className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              In hóa đơn
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md border border-transparent bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
