import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    // last message snapshot cho list nhanh
    lastMessage: {
      text: { type: String, default: "" },
      type: { type: String, enum: ["text", "image"], default: "text" },
      at: { type: Date },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    // optional: đánh dấu nếu là hội thoại với admin
    isSupport: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ConversationSchema.index({ members: 1 });
ConversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
