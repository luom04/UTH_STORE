// src/socket.js
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { ChatService } from "./services/chat.service.js";
import { Chat } from "./models/chat.model.js";

export const attachSocket = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // 🔒 MIDDLEWARE: Xác thực User qua cookie (nếu có)
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;

      if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        const accessToken = cookies.access_token;

        if (accessToken) {
          const decoded = jwt.verify(accessToken, config.jwt.accessSecret);
          socket.user = { _id: decoded.sub, role: decoded.role };
        }
      }
    } catch (err) {
      // Token lỗi hoặc không có cookie, bỏ qua
    }
    next();
  });

  io.on("connection", (socket) => {
    // ==================================================
    // 🟢 CUSTOMER EVENTS
    // ==================================================

    // Khách join vào room theo sessionId
    socket.on("join_chat", (sessionId) => {
      if (!sessionId) return;
      socket.join(sessionId);
    });

    // Khách gửi tin nhắn
    socket.on("client_send_message", async (data) => {
      try {
        const userId = socket.user ? socket.user._id : null;
        const { sessionId, content } = data || {};

        if (!sessionId || !content) {
          return;
        }

        const { chat, response } = await ChatService.handleUserMessage({
          ...data,
          userId,
        });

        // Nếu AI trả lời được
        if (response) {
          io.to(sessionId).emit("server_send_message", {
            sender: "ai",
            content: response,
            timestamp: new Date(),
          });
        }

        // Update cho tất cả admin đang mở dashboard
        io.to("admin_room").emit("admin_receive_message", {
          sessionId,
          chatData: chat,
        });
      } catch (err) {
        socket.emit("error", "Lỗi xử lý tin nhắn từ khách");
      }
    });

    // ==================================================
    // 🔴 ADMIN EVENTS
    // ==================================================

    // Admin mở dashboard chat
    socket.on("admin_join_dashboard", () => {
      if (
        socket.user &&
        (socket.user.role === "admin" || socket.user.role === "staff")
      ) {
        socket.join("admin_room");
      }
    });

    // Admin gửi tin nhắn cho một session
    socket.on("admin_send_message", async (data) => {
      try {
        if (
          !socket.user ||
          (socket.user.role !== "admin" && socket.user.role !== "staff")
        ) {
          return;
        }

        const { sessionId, content } = data || {};
        if (!sessionId || !content) {
          return;
        }

        const updatedChat = await ChatService.handleAdminMessage({
          sessionId,
          content,
        });

        // Gửi tin nhắn admin cho khách
        io.to(sessionId).emit("server_send_message", {
          sender: "admin",
          content,
          timestamp: new Date(),
        });

        // Confirm cho admin
        socket.emit("admin_sent_success", {
          sessionId,
          content,
        });

        // Đồng bộ lại full chat cho toàn bộ admin trong admin_room
        io.to("admin_room").emit("admin_receive_message", {
          sessionId,
          chatData: updatedChat,
        });
      } catch (err) {
        socket.emit("error", "Lỗi gửi tin nhắn admin");
      }
    });

    // ==================================================
    // 🎚 ADMIN SET AI MODE (BẬT/TẮT AI CHO 1 CUỘC CHAT)
    // ==================================================
    socket.on("admin_set_ai_mode", async ({ sessionId, needsHuman }) => {
      try {
        if (
          !socket.user ||
          (socket.user.role !== "admin" && socket.user.role !== "staff")
        ) {
          return;
        }

        if (!sessionId) return;

        // needsHuman = true  => AI TẮT, người thật xử lý
        // needsHuman = false => AI BẬT, trả lời tự động
        const updatedChat = await Chat.findOneAndUpdate(
          { sessionId },
          { needsHuman: !!needsHuman, lastActivity: new Date() },
          { new: true }
        )
          .populate("user", "name email")
          .lean();

        if (!updatedChat) return;

        // Gửi thông tin mode mới cho mọi admin
        io.to("admin_room").emit("admin_ai_mode_updated", {
          sessionId,
          needsHuman: updatedChat.needsHuman,
        });
      } catch (err) {
        // Xử lý lỗi ngầm
      }
    });

    // ==================================================
    // 🔌 DISCONNECT
    // ==================================================
    socket.on("disconnect", () => {
      // Disconnected
    });
  });

  return io;
};
