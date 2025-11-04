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
