import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";

export const MessageService = {
  async list(convId, userId, { page = 1, limit = 30 }) {
    // kiểm tra quyền
    const conv = await Conversation.findById(convId);
    if (!conv)
      throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
    if (!conv.members.map(String).includes(String(userId))) {
      throw new ApiError(httpStatus.FORBIDDEN, "No access");
    }

    page = Number(page) || 1;
    limit = Math.min(Number(limit) || 30, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Message.find({ conversation: convId, deletedAt: { $exists: false } })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Message.countDocuments({
        conversation: convId,
        deletedAt: { $exists: false },
      }),
    ]);

    return { items: items.reverse(), meta: { page, limit, total } }; // đảo lại chronological
  },

  async sendText(convId, userId, text) {
    if (!text || !text.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Text required");
    }
    const conv = await Conversation.findById(convId);
    if (!conv)
      throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
    if (!conv.members.map(String).includes(String(userId))) {
      throw new ApiError(httpStatus.FORBIDDEN, "No access");
    }

    const msg = await Message.create({
      conversation: convId,
      sender: userId,
      type: "text",
      text: text.trim(),
    });

    conv.lastMessage = {
      text: msg.text,
      type: "text",
      at: msg.createdAt,
      by: userId,
    };
    await conv.save();

    return msg;
  },

  async sendImage(convId, userId, { imageUrl, imagePublicId }) {
    if (!imageUrl)
      throw new ApiError(httpStatus.BAD_REQUEST, "imageUrl required");
    const conv = await Conversation.findById(convId);
    if (!conv)
      throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
    if (!conv.members.map(String).includes(String(userId))) {
      throw new ApiError(httpStatus.FORBIDDEN, "No access");
    }

    const msg = await Message.create({
      conversation: convId,
      sender: userId,
      type: "image",
      imageUrl,
      imagePublicId,
    });

    conv.lastMessage = {
      text: "[image]",
      type: "image",
      at: msg.createdAt,
      by: userId,
    };
    await conv.save();

    return msg;
  },

  async editMessage(msgId, userId, newText) {
    const msg = await Message.findById(msgId);
    if (!msg) throw new ApiError(httpStatus.NOT_FOUND, "Message not found");
    if (String(msg.sender) !== String(userId))
      throw new ApiError(httpStatus.FORBIDDEN, "Cannot edit others' messages");
    msg.text = String(newText || "");
    msg.editedAt = new Date();
    await msg.save();
    return msg;
  },

  async deleteMessage(msgId, userId, isAdmin = false) {
    const msg = await Message.findById(msgId);
    if (!msg) throw new ApiError(httpStatus.NOT_FOUND, "Message not found");

    const canDelete = isAdmin || String(msg.sender) === String(userId);
    if (!canDelete) throw new ApiError(httpStatus.FORBIDDEN, "Cannot delete");

    msg.deletedAt = new Date();
    await msg.save();
    return { deleted: true };
  },

  async markRead(convId, userId) {
    await Message.updateMany(
      { conversation: convId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );
    return { success: true };
  },
};
