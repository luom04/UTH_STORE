//src/services/auth.service.js
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { EmailToken, RefreshToken } from "../models/token.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { config } from "../config.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 32);

export const AuthService = {
  async register({ name, email, password }) {
    // 1. Check email exists
    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing && existing.isEmailVerified) {
      throw new ApiError(httpStatus.CONFLICT, "Email already exists");
    }

    if (existing && !existing.isEmailVerified) {
      // Gọi resend thay vì duplicate code
      return this.resendVerificationEmail(email);
    }

    // 2. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log("🔑 Token generated at:", new Date().toISOString());
    console.log("⏰ Token expires at:", verificationTokenExpires.toISOString());

    // 3. Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "customer",
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // 4. Send verification email
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: verificationToken,
      });
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (error) {
      console.error("❌ Failed to send email:", error);
    }

    // 5. Return
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    const user = await User.findOne({
      email: email.toLowerCase(),
      isEmailVerified: false, // Chỉ resend cho user chưa verify
    });

    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User not found or already verified"
      );
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(verificationTokenExpires);
    await user.save();

    // Send email
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: verificationToken,
      });
      console.log(`✅ Resent verification email to ${user.email}`);
    } catch (error) {
      console.error("❌ Failed to resend email:", error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to send email"
      );
    }

    return {
      message: "Verification email resent. Please check your inbox.",
    };
  },

  // ✅ FIX: verifyEmail - log để debug
  // async verifyEmail(token) {
  //   console.log("🔍 Verifying token:", token);
  //   console.log("⏰ Current time:", new Date().toISOString());

  //   const user = await User.findOne({
  //     verificationToken: token,
  //     verificationTokenExpires: { $gt: new Date() }, // ✅ So sánh với Date object
  //   }).select("+verificationToken +verificationTokenExpires");

  //   if (!user) {
  //     console.log("❌ Token not found or expired");
  //     throw new ApiError(
  //       httpStatus.BAD_REQUEST,
  //       "Invalid or expired verification token"
  //     );
  //   }

  //   console.log(
  //     "✅ Token valid, expires at:",
  //     user.verificationTokenExpires.toISOString()
  //   );

  //   user.isEmailVerified = true;
  //   user.verificationToken = undefined;
  //   user.verificationTokenExpires = undefined;
  //   await user.save();

  //   return {
  //     message: "Email verified successfully. You can now login.",
  //   };
  // },

  //mới thay
  // backend/src/services/auth.service.js
  async verifyEmail(token) {
    console.log("🔍 Verifying token:", token);
    console.log("⏰ Current time:", new Date().toISOString());

    // ✅ First find without expiry check
    const allUsers = await User.find({}).select(
      "+verificationToken +verificationTokenExpires"
    );
    console.log(
      "📊 All users with tokens:",
      allUsers.map((u) => ({
        email: u.email,
        token: u.verificationToken?.substring(0, 10) + "...",
        expires: u.verificationTokenExpires,
      }))
    );

    // ✅ Find exact token match
    const userByToken = await User.findOne({
      verificationToken: token,
    }).select("+verificationToken +verificationTokenExpires");

    console.log("🔎 User found by token?", userByToken ? "YES" : "NO");
    if (userByToken) {
      console.log("📧 Email:", userByToken.email);
      console.log("🔑 Token match:", userByToken.verificationToken === token);
      console.log(
        "⏰ Expires:",
        userByToken.verificationTokenExpires?.toISOString()
      );
      console.log(
        "⏰ Expired?",
        userByToken.verificationTokenExpires < new Date()
      );
    }

    // ✅ Now check with expiry
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      console.log("❌ Token not found or expired");
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired verification token"
      );
    }

    console.log("✅ Token valid, verifying user...");

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log("✅ User verified successfully");

    return {
      message: "Email verified successfully. You can now login.",
    };
  },

  async login({ email, password, ip, ua }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    // Phòng trường hợp user được tạo từ Google (không có password local)
    if (!user.password) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    const ok = await user.comparePassword(password);
    if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");

    // ✅ CHECK: Account có bị khoá không?
    if (!user.isEmailVerified) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        // "Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên."
        "Please verify your email before logging in"
      );
    }
    // ⚠️ Truyền user để lấy đúng role khi ký JWT
    const tokens = await this.issueTokens(user, ip, ua);
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  },

  async issueTokens(userOrId, ip, ua, family = crypto.randomUUID()) {
    const user =
      typeof userOrId === "object" ? userOrId : await User.findById(userOrId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    // Ký access token với role thật từ DB (đã chuẩn hóa "CUSTOMER" | "STAFF" | "ADMIN")
    const accessToken = signAccessToken({
      sub: String(user._id),
      role: user.role,
    });

    // Tạo refresh token chuỗi thô (plain) rồi hash lưu vào DB
    const refreshTokenPlain = signRefreshToken({
      sub: String(user._id),
      family,
    });
    const { exp } = verifyRefreshToken(refreshTokenPlain);
    const tokenHash = RefreshToken.hash(refreshTokenPlain);

    await RefreshToken.create({
      user: user._id,
      tokenHash,
      family,
      expiresAt: new Date(exp * 1000),
      ip,
      ua,
    });

    return { accessToken, refreshToken: refreshTokenPlain };
  },

  async refresh({ refreshToken, ip, ua }) {
    if (!refreshToken)
      throw new ApiError(httpStatus.UNAUTHORIZED, "Missing refresh token");
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
    const hash = RefreshToken.hash(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash: hash });
    if (!stored)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token not recognized (possible reuse)"
      );
    if (stored.used || stored.revoked)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token already used or revoked"
      );
    if (stored.expiresAt < new Date())
      throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token expired");

    stored.used = true; // rotation
    await stored.save();

    // Phát hành cặp token mới (cùng family) — cần user để lấy role
    const user = await User.findById(stored.user);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    return this.issueTokens(user, ip, ua, payload.family);
  },
  // Yêu cầu đặt lại mật khẩu: gửi email có token
  async requestPasswordReset({ email }) {
    const user = await User.findOne({ email });
    if (!user) return { sent: true }; // tránh lộ email tồn tại

    const token = nanoid();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 phút
    await EmailToken.create({
      user: user._id,
      token,
      type: "reset",
      expiresAt,
    });

    await sendEmail({
      to: email,
      subject: "Reset your uthStore password",
      html: `<p>Click to reset password:</p>
           <p><a href="${config.clientUrl}/auth/reset-password?token=${token}">Reset Password</a></p>
           <p>Token valid for 30 minutes.</p>`,
    });

    return { sent: true };
  },

  // Đặt lại mật khẩu bằng token
  async resetPassword({ token, newPassword }) {
    const doc = await EmailToken.findOne({
      token,
      type: "reset",
      expiresAt: { $gt: new Date() },
    });
    if (!doc)
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired token");

    const user = await User.findById(doc.user).select("+password");
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    user.password = newPassword;
    await user.save();

    // thu hồi tất cả refresh token hiện có (đảm bảo an toàn)
    await RefreshToken.updateMany(
      { user: user._id, revoked: false },
      { $set: { revoked: true } }
    );

    // xóa toàn bộ token reset cũ
    await EmailToken.deleteMany({ user: user._id, type: "reset" });
    return { success: true };
  },
  async logout({ refreshToken }) {
    if (!refreshToken) return { success: true };
    try {
      const hash = RefreshToken.hash(refreshToken);
      const stored = await RefreshToken.findOne({ tokenHash: hash });
      if (stored) {
        stored.revoked = true;
        await stored.save();
      }
    } catch {}
    return { success: true };
  },
  async updateMe(userId, payload) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const allowed = ["name", "phone", "gender", "dob"];
    for (const k of allowed) {
      if (typeof payload[k] !== "undefined") {
        if (k === "dob" && payload.dob && typeof payload.dob === "object") {
          user.dob = {
            d: payload.dob.d ?? user.dob?.d ?? "",
            m: payload.dob.m ?? user.dob?.m ?? "",
            y: payload.dob.y ?? user.dob?.y ?? "",
          };
        } else {
          user[k] = payload[k];
        }
      }
    }
    await user.save(); // Trả về data “an toàn”
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      role: String(user.role || "").toLowerCase(), // 👈
      verified: user.isEmailVerified,
    };
  },
};
