import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { MessageService } from "../services/message.service.js";

export const listMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items, meta } = await MessageService.list(
    req.params.conversationId,
    userId,
    req.query
  );
  return ok(res, items, meta);
});

export const sendText = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const msg = await MessageService.sendText(
    req.params.conversationId,
    userId,
    req.body.text
  );
  return created(res, msg);
});

export const sendImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const msg = await MessageService.sendImage(
    req.params.conversationId,
    userId,
    {
      imageUrl: req.body.imageUrl,
      imagePublicId: req.body.imagePublicId,
    }
  );
  return created(res, msg);
});

export const editMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const msg = await MessageService.editMessage(
    req.params.messageId,
    userId,
    req.body.text
  );
  return ok(res, msg);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === "admin";
  const result = await MessageService.deleteMessage(
    req.params.messageId,
    userId,
    isAdmin
  );
  return ok(res, result);
});

export const markRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await MessageService.markRead(
    req.params.conversationId,
    userId
  );
  return ok(res, result);
});
