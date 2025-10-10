import { Router } from "express";
import passport from "passport";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  upsertOneToOne,
  listMyConversations,
  getConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

// cần đăng nhập
router.use(passport.authenticate("jwt", { session: false }), requireAuth);

// tạo/tìm hội thoại 1-1
router.post("/upsert", upsertOneToOne);

// list hội thoại của tôi
router.get("/", listMyConversations);

// lấy 1 hội thoại (đồng thời xác thực quyền)
router.get("/:id", getConversation);

export default router;
