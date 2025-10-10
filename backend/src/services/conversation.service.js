import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Conversation } from "../models/conversation.model.js";

export const ConversationService = {
  async upsertOneToOne(userIdA, userIdB, isSupport = false) {
    // đảm bảo một cặp 1-1 duy nhất (không tạo trùng)
    const conv = await Conversation.findOne({
      members: { $all: [userIdA, userIdB], $size: 2 },
      isSupport,
    });
    if (conv) return conv;
    return Conversation.create({ members: [userIdA, userIdB], isSupport });
  },

  async listForUser(userId, { page = 1, limit = 20 }) {
    page = Number(page) || 1;
    limit = Math.min(Number(limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Conversation.find({ members: userId })
        .sort("-updatedAt")
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ members: userId }),
    ]);

    return { items, meta: { page, limit, total } };
  },

  async getByIdForUser(convId, userId) {
    const conv = await Conversation.findById(convId);
    if (!conv)
      throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
    if (!conv.members.map(String).includes(String(userId))) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "No access to this conversation"
      );
    }
    return conv;
  },
};
