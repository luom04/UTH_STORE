import { Router } from "express";
import passport from "passport";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  listMessages,
  sendText,
  sendImage,
  editMessage,
  deleteMessage,
  markRead,
} from "../controllers/message.controller.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }), requireAuth);

// list paging
router.get("/:conversationId", listMessages);

// gửi text
router.post("/:conversationId/text", sendText);

// gửi image (imageUrl + imagePublicId đã có từ Cloudinary Step 4)
router.post("/:conversationId/image", sendImage);

// edit / delete message
router.put("/item/:messageId", editMessage);
router.delete("/item/:messageId", deleteMessage);

// mark as read
router.post("/:conversationId/read", markRead);

export default router;
