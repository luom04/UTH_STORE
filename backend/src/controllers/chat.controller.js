//src/controller/chat.controller.js
import { ChatService } from "../services/chat.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class ChatController {
  // GET /api/chat/history/:sessionId
  static getHistory = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const chat = await ChatService.getHistory(sessionId);
    res.json({ success: true, data: chat ? chat.messages : [] });
  });

  // GET /api/chat/admin/active (Cho admin dashboard)
  static getActiveChats = asyncHandler(async (req, res) => {
    const chats = await ChatService.getAllActiveChats();
    res.json({ success: true, data: chats });
  });

  // DELETE /api/chats/admin/:sessionId
  // Chỉ admin mới được gọi (middleware handle)
  static archiveChat = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const chat = await ChatService.archiveChat(sessionId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy cuộc trò chuyện" });
    }

    return res.json({
      success: true,
      message:
        "Đã xóa cuộc trò chuyện khỏi danh sách admin (khách vẫn thấy lịch sử).",
    });
  });
}
