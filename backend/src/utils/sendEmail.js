// backend/src/utils/sendEmail.js
import nodemailer from "nodemailer";
import { ApiError } from "./apiError.js";
import httpStatus from "http-status";

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true", // false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || subject, // Fallback to subject if no text
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to send email: ${error.message}`
    );
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail({ to, name, token }) {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Chào mừng đến UTH Store!</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${name}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>UTH Store</strong>.</p>
          <p>Vui lòng xác nhận địa chỉ email của bạn bằng cách click vào nút bên dưới:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">
              ✅ Xác nhận Email
            </a>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Hoặc copy link sau vào trình duyệt:
          </p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-size: 12px;">
            ${verificationUrl}
          </p>
          
          <p style="margin-top: 20px; font-size: 12px; color: #888;">
            ⏰ Link này sẽ hết hạn sau 24 giờ.
          </p>
          
          <p style="margin-top: 30px; color: #666;">
            Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 UTH Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: "Xác nhận email - UTH Store",
    html,
  });
}

// backend/src/utils/sendEmail.js

/**
 * Send order confirmation email
 * @param {object} order Đơn hàng đã tạo (Mongoose doc hoặc plain object)
 * @param {object} user  Thông tin user (có email, name)
 */
export async function sendOrderConfirmationEmail(order, user) {
  if (!user?.email) return;

  const plainOrder =
    typeof order.toObject === "function" ? order.toObject() : order || {};

  const {
    orderNumber,
    items = [],
    itemsTotal = 0, // ✅ trong DB hiện tại là "sau HSSV"
    shippingFee = 0,
    grandTotal = 0,
    paymentMethod = "cod",
    couponCode,
    discountAmount = 0,
    studentDiscountAmount = 0,
    paymentStatus, // ✅ thêm
  } = plainOrder;

  // ✅ Xác định đây có phải mail "ĐÃ THANH TOÁN VNPay" hay không
  const isVNPayPaid =
    String(paymentMethod).toLowerCase() === "vnpay" &&
    String(paymentStatus).toLowerCase() === "paid";

  // ✅ Tổng tiền hàng trước HSSV (giữ như bạn đang làm)
  const itemsTotalOriginal =
    Number(itemsTotal) + Number(studentDiscountAmount || 0);

  // ✅ SUBJECT: khác nhau giữa COD & VNPay đã thanh toán
  const subject = isVNPayPaid
    ? `[UTH Store] Đơn hàng ${orderNumber} đã thanh toán thành công qua VNPay`
    : `[UTH Store] Đơn hàng ${orderNumber} đã được đặt thành công`;

  // ✅ FIX Ở ĐÂY: Tổng phụ phải là GIÁ TRƯỚC HSSV
  const itemDetailsHtml = items
    .map((item) => {
      const qty = Number(item.qty || 0);

      const unitOriginal =
        typeof item.originalPrice === "number" && item.originalPrice > 0
          ? item.originalPrice
          : Number(item.price || 0) + Number(item.studentDiscountPerUnit || 0);

      const lineOriginalSubtotal = unitOriginal * qty;

      const giftsHtml =
        Array.isArray(item.gifts) && item.gifts.length > 0
          ? `<div style="margin-top:6px; font-size:12px; color:#B91C1C;">
               🎁 Quà tặng kèm: ${item.gifts.join(", ")}
             </div>`
          : "";

      return `<tr>
        <td>
          ${item.title}
          ${giftsHtml}
        </td>
        <td style="text-align: right;">${qty}</td>
        <td style="text-align: right;">${lineOriginalSubtotal.toLocaleString()}đ</td>
      </tr>`;
    })
    .join("");

  const studentDiscountRow =
    Number(studentDiscountAmount) > 0
      ? `<tr>
          <td colspan="2" style="text-align: right; color:#059669; font-weight:600;">
            Giảm giá HSSV:
          </td>
          <td style="text-align: right; color:#059669; font-weight:600;">
            -${Number(studentDiscountAmount).toLocaleString()}đ
          </td>
        </tr>`
      : "";

  const voucherRow =
    Number(discountAmount) > 0
      ? `<tr>
          <td colspan="2" style="text-align: right; color:#16A34A; font-weight:600;">
            Voucher ${couponCode || ""}:
          </td>
          <td style="text-align: right; color:#16A34A; font-weight:600;">
            -${Number(discountAmount).toLocaleString()}đ
          </td>
        </tr>`
      : "";

  // ✅ Tuỳ theo isVNPayPaid mà đổi text tiêu đề
  const headerTitle = isVNPayPaid
    ? "💳 Thanh toán VNPay thành công!"
    : "🛒 Đặt hàng thành công!";

  const introLine = isVNPayPaid
    ? `Đơn hàng của bạn đã được thanh toán thành công qua <strong>VNPay</strong>.`
    : `Đơn hàng của bạn đã được tạo thành công tại <strong>UTH Store</strong>.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16A34A; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
        .summary-table th, .summary-table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; font-size: 14px; vertical-align: top; }
        .total-row td { font-size: 16px; font-weight: bold; color: #E53E3E; border-top: 2px solid #E53E3E; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>${headerTitle}</h1></div>
        <div class="content">
          <h2>Xin chào ${user.name || user.email},</h2>
          <p>${introLine}</p>
          <h3 style="color: #16A34A;">Mã đơn hàng: ${orderNumber}</h3>

          <h3 style="margin-top: 30px;">Chi tiết sản phẩm:</h3>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style="text-align:right;width:60px;">SL</th>
                <th style="text-align:right;width:120px;">Tổng phụ</th>
              </tr>
            </thead>
            <tbody>
              ${itemDetailsHtml}

              <tr>
                <td colspan="2" style="text-align:right;">Tổng tiền hàng:</td>
                <td style="text-align:right;">${itemsTotalOriginal.toLocaleString()}đ</td>
              </tr>

              ${studentDiscountRow}
              ${voucherRow}

              <tr>
                <td colspan="2" style="text-align:right;">Phí vận chuyển:</td>
                <td style="text-align:right;">${
                  Number(shippingFee) === 0
                    ? "Miễn phí"
                    : Number(shippingFee).toLocaleString() + "đ"
                }</td>
              </tr>

              <tr class="total-row">
                <td colspan="2" style="text-align:right;">Tổng thanh toán:</td>
                <td style="text-align:right;">${Number(
                  grandTotal
                ).toLocaleString()}đ</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Phương thức thanh toán:</strong> ${String(
            paymentMethod
          ).toUpperCase()}</p>
        </div>
        <div class="footer"><p>© 2025 UTH Store.</p></div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: user.email, subject, html });
}

/**
 * 🆕 Send order delivered email
 * Gửi khi đơn hàng đã được giao thành công (status = 'completed')
 * ✅ Có hiển thị quà tặng kèm (text gifts)
 */
export async function sendOrderDeliveredEmail(order, user) {
  if (!user?.email) return;

  const plainOrder =
    typeof order.toObject === "function" ? order.toObject() : order || {};

  const {
    orderNumber,
    items = [],
    itemsTotal = 0, // ✅ trong DB hiện tại là "sau HSSV"
    shippingFee = 0,
    grandTotal = 0,
    paymentMethod = "cod",
    updatedAt,
    couponCode,
    discountAmount = 0,
    studentDiscountAmount = 0,
  } = plainOrder;

  // ✅ Tổng tiền hàng trước HSSV (giữ như bạn đang làm)
  const itemsTotalOriginal =
    Number(itemsTotal) + Number(studentDiscountAmount || 0);

  const subject = `[UTH Store] Đơn hàng ${orderNumber} đã được giao thành công`;

  // ✅ FIX Ở ĐÂY: Tổng phụ phải là GIÁ TRƯỚC HSSV
  const itemDetailsHtml = items
    .map((item) => {
      const qty = Number(item.qty || 0);

      const unitOriginal =
        typeof item.originalPrice === "number" && item.originalPrice > 0
          ? item.originalPrice
          : Number(item.price || 0) + Number(item.studentDiscountPerUnit || 0);

      const lineOriginalSubtotal = unitOriginal * qty;

      const giftsHtml =
        Array.isArray(item.gifts) && item.gifts.length > 0
          ? `<div style="margin-top:6px; font-size:12px; color:#B91C1C;">
               🎁 Quà tặng kèm: ${item.gifts.join(", ")}
             </div>`
          : "";

      return `<tr>
        <td>
          ${item.title}
          ${giftsHtml}
        </td>
        <td style="text-align: right;">${qty}</td>
        <td style="text-align: right;">${lineOriginalSubtotal.toLocaleString()}đ</td>
      </tr>`;
    })
    .join("");

  const deliveredAtText = updatedAt
    ? new Date(updatedAt).toLocaleString("vi-VN")
    : "";

  const studentDiscountRow =
    Number(studentDiscountAmount) > 0
      ? `<tr>
          <td colspan="2" style="text-align: right; color:#059669; font-weight:600;">
            Giảm giá HSSV:
          </td>
          <td style="text-align: right; color:#059669; font-weight:600;">
            -${Number(studentDiscountAmount).toLocaleString()}đ
          </td>
        </tr>`
      : "";

  const voucherRow =
    Number(discountAmount) > 0
      ? `<tr>
          <td colspan="2" style="text-align: right; color:#16A34A; font-weight:600;">
            Voucher ${couponCode || ""}:
          </td>
          <td style="text-align: right; color:#16A34A; font-weight:600;">
            -${Number(discountAmount).toLocaleString()}đ
          </td>
        </tr>`
      : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563EB; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
        .summary-table th, .summary-table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; font-size: 14px; vertical-align: top; }
        .total-row td { font-size: 16px; font-weight: bold; color: #E53E3E; border-top: 2px solid #E53E3E; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Đơn hàng đã giao thành công!</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${user.name || user.email},</h2>
          <p>UTH Store xin thông báo <strong>đơn hàng của bạn đã được giao thành công</strong>.</p>

          <h3 style="color: #2563EB;">Mã đơn hàng: ${orderNumber}</h3>
          ${
            deliveredAtText
              ? `<p><strong>Thời gian giao hàng:</strong> ${deliveredAtText}</p>`
              : ""
          }

          <h3 style="margin-top: 30px;">Tóm tắt đơn hàng:</h3>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style="text-align:right;width:60px;">SL</th>
                <th style="text-align:right;width:120px;">Tổng phụ</th>
              </tr>
            </thead>
            <tbody>
              ${itemDetailsHtml}

              <tr>
                <td colspan="2" style="text-align:right;">Tổng tiền hàng:</td>
                <td style="text-align:right;">${itemsTotalOriginal.toLocaleString()}đ</td>
              </tr>

              ${studentDiscountRow}
              ${voucherRow}

              <tr>
                <td colspan="2" style="text-align:right;">Phí vận chuyển:</td>
                <td style="text-align:right;">${
                  Number(shippingFee) === 0
                    ? "Miễn phí"
                    : Number(shippingFee).toLocaleString() + "đ"
                }</td>
              </tr>

              <tr class="total-row">
                <td colspan="2" style="text-align:right;">Tổng thanh toán:</td>
                <td style="text-align:right;">${Number(
                  grandTotal
                ).toLocaleString()}đ</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Phương thức thanh toán:</strong> ${String(
            paymentMethod
          ).toUpperCase()}</p>
        </div>
        <div class="footer"><p>© 2025 UTH Store.</p></div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: user.email, subject, html });
}
