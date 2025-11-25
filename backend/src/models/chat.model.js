import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "ai", "admin"],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSchema = new mongoose.Schema(
  {
    // Nếu user đăng nhập thì lưu ID, khách vãng lai thì null
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ LƯU THÊM TÊN + EMAIL ĐỂ NHÌN TRONG ATLAS CHO DỄ
    customerName: { type: String, default: null },
    customerEmail: { type: String, default: null },
    // Session ID bắt buộc (lưu ở localStorage phía Client để định danh khách vãng lai)
    sessionId: { type: String, required: true, unique: true, index: true },

    messages: [MessageSchema],

    // Trạng thái: true = đang chat, false = đã đóng (resolved)
    active: { type: Boolean, default: true },

    // 🔴 QUAN TRỌNG: Cờ báo hiệu cần người thật
    // false: AI trả lời tự động
    // true: Admin đã tham gia, AI câm miệng
    needsHuman: { type: Boolean, default: false },

    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", ChatSchema);
