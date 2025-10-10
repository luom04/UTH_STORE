import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ConversationService } from "../services/conversation.service.js";

export const upsertOneToOne = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId, isSupport } = req.body;
  const conv = await ConversationService.upsertOneToOne(
    userId,
    otherUserId,
    !!isSupport
  );
  return created(res, conv);
});

export const listMyConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items, meta } = await ConversationService.listForUser(
    userId,
    req.query
  );
  return ok(res, items, meta);
});

export const getConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conv = await ConversationService.getByIdForUser(req.params.id, userId);
  return ok(res, conv);
});
