import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["text", "image"], default: "text" },
    text: { type: String, default: "" },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    editedAt: { type: Date },
    deletedAt: { type: Date },
    // read receipts đơn giản: danh sách user đã đọc
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.model("Message", MessageSchema);
