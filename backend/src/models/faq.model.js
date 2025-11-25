// src/models/faq.model.js
import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },

    // Keywords để search nhanh hơn (vd: ["bảo hành", "warranty", "laptop"])
    keywords: [{ type: String, trim: true }],

    category: { type: String, trim: true }, // vd: "Bảo hành", "Vận chuyển"
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Faq = mongoose.model("Faq", faqSchema);
