import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
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
  async register({ email, password, name }) {
    const exists = await User.findOne({ email });
    if (exists)
      throw new ApiError(httpStatus.CONFLICT, "Email already registered");
    const user = await User.create({ email, password, name });

    // email verification token
    const token = nanoid();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await EmailToken.create({
      user: user._id,
      token,
      type: "verify",
      expiresAt,
    });

    await sendEmail({
      to: email,
      subject: "Verify your uthStore account",
      html: `<p>Hello ${
        name || ""
      },</p><p>Verify your email by opening this link:</p>
<p><a href="${
        config.clientUrl
      }/verify-email?token=${token}">Verify Email</a></p>`,
    });

    return user;
  },
  async verifyEmail({ token }) {
    return user;
  },

  async login({ email, password, ip, ua }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    const ok = await user.comparePassword(password);
    if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    const tokens = await this.issueTokens(user._id, ip, ua);
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

  async issueTokens(userId, ip, ua, family = crypto.randomUUID()) {
    const accessToken = signAccessToken({ sub: String(userId), role: "user" });
    const refreshPlain = signRefreshToken({ sub: String(userId), family });
    const tokenHash = RefreshToken.hash(refreshPlain);
    const { exp } = verifyRefreshToken(refreshPlain);
    await RefreshToken.create({
      user: userId,
      tokenHash,
      family,
      expiresAt: new Date(exp * 1000),
      ip,
      ua,
    });
    return { accessToken, refreshToken: refreshPlain };
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

    // issue new pair in same family
    return this.issueTokens(stored.user, ip, ua, payload.family);
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
           <p><a href="${config.clientUrl}/reset-password?token=${token}">Reset Password</a></p>
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
};
