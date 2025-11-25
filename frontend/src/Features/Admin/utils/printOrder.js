// src/Features/Admin/utils/printOrder.js

/**
 * Mở cửa sổ mới và in hóa đơn cho một đơn hàng
 * @param {object} order - Object đơn hàng đầy đủ
 */
export function printOrderInvoice(order) {
  const statusLabel =
    {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      canceled: "Đã hủy",
    }[order.status] || order.status;

  const title =
    order.status === "canceled"
      ? "PHIẾU ĐƠN HÀNG (ĐÃ HỦY)"
      : "HÓA ĐƠN BÁN HÀNG";

  // 1. Lấy thông tin khách hàng và địa chỉ
  const customerName =
    order.shippingAddress?.fullName || order.user?.name || "-";
  const customerPhone =
    order.shippingAddress?.phone || order.user?.phone || "-";

  const address = [
    order.shippingAddress?.line1,
    order.shippingAddress?.ward,
    order.shippingAddress?.district,
    order.shippingAddress?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const items = Array.isArray(order.items) ? order.items : [];

  // ✅ Giảm giá HSSV: ưu tiên field trong Order, fallback tự tính
  const studentDiscountAmount =
    typeof order.studentDiscountAmount === "number"
      ? order.studentDiscountAmount
      : items.reduce(
          (sum, it) => sum + (it.studentDiscountPerUnit || 0) * (it.qty || 0),
          0
        );

  // ✅ itemsTotal trong DB là "sau HSSV"
  const itemsTotalAfterStudent = Number(order.itemsTotal || 0);

  // ✅ Tổng tiền hàng trước HSSV (để in đúng)
  const itemsTotalOriginal =
    itemsTotalAfterStudent + Number(studentDiscountAmount || 0);

  // ✅ Voucher
  const hasCoupon = !!order.couponCode && Number(order.discountAmount || 0) > 0;

  // =====================================================
  // ✅ PHÁT HIỆN QUÀ TẶNG (nếu có)
  // =====================================================
  const giftsFromOrder =
    order.gifts || order.giftItems || order.freeGifts || order.promoGifts || [];

  const giftItemsDetected = items.filter(
    (it) => it?.options?.isGift === true || it?.isGift === true
  );

  const gifts =
    Array.isArray(giftsFromOrder) && giftsFromOrder.length
      ? giftsFromOrder
      : giftItemsDetected;

  // Nếu có quà tặng, tách ra khỏi items chính
  const normalItems =
    gifts.length > 0
      ? items.filter(
          (it) => !(it?.options?.isGift === true || it?.isGift === true)
        )
      : items;

  // =====================================================
  // ✅ FIX CHỖ QUAN TRỌNG:
  // - Đơn giá / Thành tiền in theo GIÁ TRƯỚC HSSV
  // - Nếu có giảm HSSV thì ghi note nhỏ dưới tên sp
  // =====================================================
  let itemsHtml = "";
  if (normalItems.length) {
    itemsHtml = normalItems
      .map((item) => {
        const qty = Number(item.qty || 0);

        const unitOriginal =
          typeof item.originalPrice === "number"
            ? item.originalPrice
            : Number(item.price || 0);

        const lineOriginalSubtotal = unitOriginal * qty;

        const studentPerUnit = Number(item.studentDiscountPerUnit || 0);

        const titleHtml = `
  <div>${item.title || "-"}</div>

  ${
    Array.isArray(item.gifts) && item.gifts.length > 0
      ? `<div style="margin-top:4px; font-size:12px; color:#B91C1C;">
           🎁 Quà tặng kèm: ${item.gifts.join(", ")}
         </div>`
      : ""
  }
`;

        return `
          <tr>
            <td>${titleHtml}</td>
            <td>${qty}</td>
            <td>${unitOriginal.toLocaleString()}đ</td>
            <td style="text-align:right;">${lineOriginalSubtotal.toLocaleString()}đ</td>
          </tr>
        `;
      })
      .join("");
  }

  // ✅ Quà tặng html (nếu có)
  let giftsHtml = "";
  if (Array.isArray(gifts) && gifts.length) {
    giftsHtml = gifts
      .map(
        (g) => `
        <tr>
          <td>${g.title || g.name || "-"}</td>
          <td>${g.qty || 1}</td>
          <td>0đ</td>
          <td style="text-align:right;">0đ</td>
        </tr>
      `
      )
      .join("");
  }

  // ✅ Row giảm HSSV nếu có
  const studentRowHtml =
    Number(studentDiscountAmount) > 0
      ? `
      <tr>
        <td>Giảm giá HSSV:</td>
        <td style="text-align:right;">- ${Number(
          studentDiscountAmount
        ).toLocaleString()}đ</td>
      </tr>
    `
      : "";

  // ✅ Row voucher nếu có áp dụng
  const couponRowHtml = hasCoupon
    ? `
      <tr>
        <td>Mã giảm giá (${order.couponCode}):</td>
        <td style="text-align:right;">- ${Number(
          order.discountAmount || 0
        ).toLocaleString()}đ</td>
      </tr>
    `
    : "";

  const style = `
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 20px; 
      font-size: 14px;
      color: #333;
    }
    .header { 
      border-bottom: 2px solid #000; 
      padding-bottom: 10px; 
      margin-bottom: 20px;
      text-align: center;
    }
    .header h3 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-section h4 { margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .info-section p { margin: 4px 0; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px; 
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 10px; 
      text-align: left; 
      vertical-align: top;
    }
    th { background-color: #f4f4f4; }
    .price-breakdown { 
      margin-top: 20px; 
      width: 350px; 
      margin-left: auto; 
    }
    .price-breakdown td { border: none; padding: 5px; }
    .price-breakdown .total-row td { 
      font-weight: bold; 
      font-size: 1.2em;
      border-top: 1px solid #aaa;
    }
    .footer { margin-top: 30px; text-align: center; font-style: italic; }
  </style>
  `;

  const html = `
    <html>
    <head>
      <title>Hóa đơn ${order.orderNumber}</title>
      ${style}
    </head>
    <body>
      <div class="header">
        <h3>${title}</h3>
        <p>Mã đơn: <strong>${order.orderNumber}</strong></p>
        <p>Ngày đặt: ${new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        <p>Trạng thái: <strong>${statusLabel}</strong></p>
      </div>
      
      <div class="info-grid">
        <div class="info-section">
          <h4>Thông tin cửa hàng</h4>
          <p><strong>Cửa hàng:</strong> UTH Store </p>
          <p><strong>Website:</strong> uthstore.com</p>
          <p><strong>Hotline:</strong> 0359744735</p>
        </div>
        <div class="info-section">
          <h4>Thông tin khách hàng</h4>
          <p><strong>Tên:</strong> ${customerName}</p>
          <p><strong>SĐT:</strong> ${customerPhone}</p>
          <p><strong>Địa chỉ:</strong> ${
            address || "Khách nhận tại cửa hàng"
          }</p>
          <p><strong>Thanh toán:</strong> ${
            order.paymentMethod === "cod"
              ? "Thanh toán khi nhận hàng (COD)"
              : "Đã thanh toán Online"
          }</p>
        </div>
      </div>

      <h4>Chi tiết đơn hàng</h4>
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>SL</th>
            <th>Đơn giá</th>
            <th style="text-align:right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      ${
        giftsHtml
          ? `
        <h4 style="margin-top: 20px;">Quà tặng kèm theo</h4>
        <table>
          <thead>
            <tr>
              <th>Quà tặng</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th style="text-align:right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${giftsHtml}
          </tbody>
        </table>
      `
          : ""
      }

      <table class="price-breakdown">
        <tbody>
          <tr>
            <td>Tổng tiền hàng:</td>
            <td style="text-align:right;">${itemsTotalOriginal.toLocaleString()}đ</td>
          </tr>

          ${studentRowHtml}

          <tr>
            <td>Phí vận chuyển:</td>
            <td style="text-align:right;">${Number(
              order.shippingFee || 0
            ).toLocaleString()}đ</td>
          </tr>

          ${couponRowHtml}

          <tr class="total-row">
            <td>TỔNG CỘNG:</td>
            <td style="text-align:right;">${Number(
              order.grandTotal || 0
            ).toLocaleString()}đ</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Cảm ơn quý khách đã mua hàng!</p>
      </div>
      
      <script>window.print(); setTimeout(()=>window.close(), 300);</script>
    </body>
    </html>
  `;

  const w = window.open("", "_blank", "width=800,height=600");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
