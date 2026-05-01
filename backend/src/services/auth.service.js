//src/services/auth.service.js
import { ROLES } from "../constants/roles.js";
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { Order } from "../models/order.model.js";
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

    // 3. Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "customer",
      isEmailVerified: true,
    });
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
        "User not found or already verified",
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
        "Failed to send email",
      );
    }

    return {
      message: "Verification email resent. Please check your inbox.",
    };
  },
  // backend/src/services/auth.service.js
  async verifyEmail(token) {
    // 1. Tìm user có token khớp và chưa hết hạn
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }, // Token phải còn hạn
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email.",
      );
    }

    // 2. Update trạng thái
    user.isEmailVerified = true;
    user.verificationToken = undefined; // Xóa token sau khi dùng
    user.verificationTokenExpires = undefined;
    await user.save();

    return {
      message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.",
    };
  },

  // src/services/auth.service.js
  async login({ email, password, ip, ua }) {
    // 1. Tìm user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Thông tin đăng nhập không hợp lệ",
      );
    }

    // 2. ✅ KIỂM TRA TẠI KHOẢN BỊ KHÓA (ưu tiên cao nhất)
    if (!user.isActive) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ bộ phận hỗ trợ.",
      );
    }

    // 3. Kiểm tra OAuth user
    if (!user.password) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Tài khoản này sử dụng thông tin đăng nhập Google. Vui lòng đăng nhập bằng Google.",
      );
    }

    // 4. So sánh password
    const ok = await user.comparePassword(password);
    if (!ok) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Thông tin đăng nhập không hợp lệ",
      );
    }

    // 5. ✅ KIỂM TRA EMAIL VERIFICATION (chỉ với customer)
    if (user.role === ROLES.CUSTOMER && !user.isEmailVerified) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Vui lòng xác minh email của bạn trước khi đăng nhập. Kiểm tra hộp thư đến của bạn để biết liên kết xác minh",
      );
    }

    // 6. Issue tokens
    const tokens = await this.issueTokens(user, ip, ua);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        isStudent: user.isStudent, // 🆕 Trả về status
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
        "Token not recognized (possible reuse)",
      );
    if (stored.used || stored.revoked)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token already used or revoked",
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
      { $set: { revoked: true } },
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
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    // 1. Tính tổng chi tiêu (Chỉ tính đơn hoàn thành)
    const stats = await Order.aggregate([
      {
        $match: {
          user: user._id,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$grandTotal" },
        },
      },
    ]);

    const totalSpent = stats[0]?.totalSpent || 0;

    // 2. Tính Rank (Logic giống hệt Admin Service)
    let rank = "MEMBER";
    if (totalSpent >= 100_000_000) rank = "DIAMOND";
    else if (totalSpent >= 50_000_000) rank = "GOLD";
    else if (totalSpent >= 10_000_000) rank = "SILVER";

    // 3. Trả về User + Rank + TotalSpent
    // Lưu ý: user.toJSON() để bỏ password, __v...
    return {
      ...user.toJSON(),
      totalSpent,
      rank,
    };
  },

  async requestStudentVerify(userId, { studentIdImage, schoolName }) {
    if (!studentIdImage || !schoolName) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Vui lòng cung cấp ảnh thẻ và tên trường",
      );
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User không tồn tại");

    // Cập nhật thông tin và chuyển trạng thái sang chờ duyệt
    user.studentInfo = {
      studentIdImage,
      schoolName,
      status: "pending", // 🟡 Chờ duyệt
      rejectedReason: "", // Xóa lý do từ chối cũ (nếu có)
      submittedAt: new Date(),
    };

    await user.save();
    return user;
  },

  /**
   * [ADMIN] Duyệt hoặc Từ chối yêu cầu
   */
  async verifyStudentRequest(targetUserId, { status, reason }) {
    // Chỉ chấp nhận 2 trạng thái này từ Admin
    if (!["verified", "rejected"].includes(status)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Trạng thái duyệt không hợp lệ",
      );
    }

    const user = await User.findById(targetUserId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User không tồn tại");

    if (status === "verified") {
      // ✅ DUYỆT: Bật quyền lợi
      user.isStudent = true;
      user.studentInfo.status = "verified";
      user.studentInfo.rejectedReason = "";
    } else {
      // ❌ TỪ CHỐI: Tắt quyền lợi
      user.isStudent = false;
      user.studentInfo.status = "rejected";
      user.studentInfo.rejectedReason =
        reason || "Thông tin không hợp lệ (Ảnh mờ/Không khớp)";
    }

    await user.save();
    return user;
  },

  /**
   * [ADMIN] Lấy danh sách các yêu cầu đang chờ (Pending)
   */
  async getPendingStudentRequests() {
    // Chỉ lấy những user đang có status là pending
    return await User.find({ "studentInfo.status": "pending" })
      .select("name email phone studentInfo createdAt") // Chọn field cần thiết
      .sort({ "studentInfo.submittedAt": 1 }); // Ai gửi trước hiện trước
  },
};
