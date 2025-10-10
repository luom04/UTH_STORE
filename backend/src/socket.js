import { Server } from "socket.io";
import cookie from "cookie";
import { verifyAccessToken } from "./utils/jwt.js";
import { MessageService } from "./services/message.service.js";
import { ConversationService } from "./services/conversation.service.js";

export const attachSocket = (server, corsOrigin) => {
  const io = new Server(server, {
    cors: { origin: corsOrigin, credentials: true },
  });

  // middleware auth
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const parsed = cookie.parse(raw || "");
      const token = parsed["access_token"];
      if (!token) return next(new Error("Unauthorized"));
      const payload = verifyAccessToken(token); // { sub, role, iat, exp }
      socket.user = { id: payload.sub, role: payload.role };
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    // client gọi join phòng hội thoại
    socket.on("conversation:join", async (convId) => {
      try {
        await ConversationService.getByIdForUser(convId, userId); // check quyền
        socket.join(`conv:${convId}`);
        socket.emit("conversation:joined", convId);
      } catch (e) {
        socket.emit("error", e.message);
      }
    });

    // gửi text
    socket.on("message:send", async ({ conversationId, text }) => {
      try {
        const msg = await MessageService.sendText(conversationId, userId, text);
        io.to(`conv:${conversationId}`).emit("message:new", msg);
      } catch (e) {
        socket.emit("error", e.message);
      }
    });

    // báo typing
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket
        .to(`conv:${conversationId}`)
        .emit("typing", { userId, isTyping: !!isTyping });
    });

    // edit
    socket.on("message:edit", async ({ messageId, text }) => {
      try {
        const msg = await MessageService.editMessage(messageId, userId, text);
        io.to(`conv:${msg.conversation}`).emit("message:updated", msg);
      } catch (e) {
        socket.emit("error", e.message);
      }
    });

    // delete
    socket.on("message:delete", async ({ messageId }) => {
      try {
        // lấy conversation để broadcast
        // nhỏ gọn: fetch message sau khi xóa không còn conv => tùy chọn cải thiện
        const result = await MessageService.deleteMessage(
          messageId,
          userId,
          socket.user.role === "admin"
        );
        io.emit("message:deleted", { messageId, result }); // hoặc gửi vào room tương ứng nếu có convId đi kèm
      } catch (e) {
        socket.emit("error", e.message);
      }
    });

    // read
    socket.on("message:read", async ({ conversationId }) => {
      try {
        await MessageService.markRead(conversationId, userId);
        socket
          .to(`conv:${conversationId}`)
          .emit("message:read", { conversationId, userId });
      } catch (e) {
        socket.emit("error", e.message);
      }
    });
  });

  return io;
};
