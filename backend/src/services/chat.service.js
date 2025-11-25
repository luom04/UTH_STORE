// src/services/chat.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat } from "../models/chat.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Faq } from "../models/faq.model.js";
import { User } from "../models/user.model.js";

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Dùng model mới
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class ChatService {
  /**
   * 🧠 RAG CORE: Tìm dữ liệu liên quan trong DB
   * - Sản phẩm
   * - Đơn hàng
   * - FAQ nội bộ (Câu hỏi thường gặp)
   */
  static async findContextData(query, userId) {
    let contextText = "";

    // ===============================
    // 1) TÌM SẢN PHẨM LIÊN QUAN
    // ===============================
    let productResults = [];

    // 🔹 1.1. ƯU TIÊN: TEXT SEARCH (cần tạo text index trên collection products)
    //
    // Trong mongosh hoặc Atlas Shell chạy một lần:
    // db.products.createIndex({ title: "text", slug: "text", description: "text" })
    //
    try {
      productResults = await Product.find(
        {
          $text: { $search: query },
          status: "active",
        },
        {
          score: { $meta: "textScore" }, // lấy điểm match để sort
        }
      )
        .sort({ score: { $meta: "textScore" } })
        .select(
          "title price priceSale stock isFeatured slug shortDescription description"
        )
        .limit(3)
        .lean();
    } catch (err) {
      console.error("[ChatService] Product text search error:", err.message);
    }

    // 🔹 1.2. FALLBACK: Nếu text search không ra gì → dùng regex theo keyword
    if (!productResults || productResults.length === 0) {
      const rawWords = query.toLowerCase().split(/\s+/).filter(Boolean);

      const stopWords = [
        "bạn",
        "anh",
        "chị",
        "em",
        "có",
        "bán",
        "mua",
        "này",
        "kia",
        "không",
        "ko",
        "hông",
        "bao",
        "nhiêu",
        "giá",
        "con",
        "cái",
        "máy",
        "laptop",
      ];

      const keyWords = rawWords.filter(
        (w) => w.length >= 3 && !stopWords.includes(w)
      );

      // Lấy tối đa 5 từ khoá đầu (đủ để match: acer, aspire, a715, 59g, 78wg, rtx4060,…)
      const topWords = keyWords.slice(0, 5);

      const regexes = topWords.map((w) => {
        const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(escaped, "i");
      });

      if (regexes.length > 0) {
        const orConds = regexes.map((re) => ({ title: re }));

        try {
          productResults = await Product.find({
            $or: orConds,
            status: "active",
          })
            .select(
              "title price priceSale stock isFeatured slug shortDescription description"
            )
            .limit(3)
            .lean();
        } catch (err) {
          console.error(
            "[ChatService] Product regex fallback error:",
            err.message
          );
        }
      }
    }

    // 🔹 1.3. BUILD CONTEXT CHO SẢN PHẨM
    if (productResults && productResults.length > 0) {
      contextText += "\n[DỮ LIỆU KHO HÀNG]:\n";

      productResults.forEach((p) => {
        const price = p.priceSale > 0 ? p.priceSale : p.price;
        const stockStatus = p.stock > 0 ? `Còn hàng ` : "Hết hàng";

        // mô tả ngắn gọn, tránh đổ nguyên description dài
        const desc =
          p.shortDescription ||
          (p.description && p.description.slice(0, 200)) ||
          "";

        contextText += `- Sản phẩm: ${p.title}
  Giá: ${price?.toLocaleString?.("vi-VN") || price} VND
  Tình trạng: ${stockStatus}
  Mô tả ngắn: ${desc}
`;
      });
    }

    // ===============================
    // 2) THÔNG TIN ĐƠN HÀNG (ORDxxxx)
    // ===============================
    const orderMatch = query.match(/ORD\d+/i);
    if (orderMatch) {
      const orderCode = orderMatch[0].toUpperCase();

      try {
        const order = await Order.findOne({ orderNumber: orderCode })
          .select("status grandTotal paymentStatus items")
          .lean();

        if (order) {
          contextText += `\n[THÔNG TIN ĐƠN HÀNG ${orderCode}]:\n`;
          contextText += `- Trạng thái: ${order.status}\n`;
          contextText += `- Thanh toán: ${order.paymentStatus}\n`;
          contextText += `- Tổng tiền: ${
            order.grandTotal?.toLocaleString?.("vi-VN") || order.grandTotal
          } VND\n`;
        }
      } catch (err) {
        console.error("[ChatService] Order lookup error:", err.message);
      }
    }

    // ===============================
    // 3) FAQ NỘI BỘ (CÂU HỎI THƯỜNG GẶP)
    // ===============================
    try {
      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

      const faqResults = await Faq.find({
        isActive: true,
        $or: [
          { question: { $regex: query, $options: "i" } },
          { keywords: { $in: tokens } },
        ],
      })
        .select("question answer")
        .limit(3)
        .lean();

      if (faqResults.length > 0) {
        contextText += "\n[CÂU HỎI THƯỜNG GẶP]:\n";
        faqResults.forEach((f, idx) => {
          contextText += `Q${idx + 1}: ${f.question}\nA${idx + 1}: ${
            f.answer
          }\n`;
        });
      }
    } catch (err) {
      console.error("[ChatService] FAQ lookup error:", err.message);
    }

    return contextText;
  }

  /**
   * Xử lý tin nhắn từ User
   * - Ưu tiên tìm theo userId (1 user chỉ 1 chat active)
   * - Nếu không có → fallback theo sessionId
   * - Không để tạo trùng 2 chat cho cùng 1 user
   */
  static async handleUserMessage({ sessionId, userId, content }) {
    if (!sessionId || !content) {
      throw new Error("Missing sessionId or content");
    }

    let chat = null;

    // ✅ 1) Nếu user đã đăng nhập: ưu tiên tìm theo userId + active
    if (userId) {
      chat = await Chat.findOne({ user: userId, active: true }).sort({
        updatedAt: -1,
      });
    }

    // ✅ 2) Nếu chưa có chat cho user (hoặc userId null) → tìm theo sessionId
    if (!chat) {
      chat = await Chat.findOne({ sessionId });
    }

    // ✅ 3) Nếu vẫn không có → tạo mới
    if (!chat) {
      chat = new Chat({
        sessionId,
        user: userId || null,
        messages: [],
      });
    } else {
      // Ghép dữ liệu cho nhất quán
      if (!chat.sessionId || chat.sessionId !== sessionId) {
        chat.sessionId = sessionId;
      }
      if (!chat.user && userId) {
        chat.user = userId;
      }
    }

    // ✅ 3.1: Nếu có userId → lấy tên & email và lưu thẳng vào chat
    if (userId) {
      // Chỉ fetch nếu thiếu thông tin
      if (!chat.customerName || !chat.customerEmail) {
        const user = await User.findById(userId)
          .select("name email")
          .lean()
          .exec();
        if (user) {
          chat.customerName = user.name || chat.customerName;
          chat.customerEmail = user.email || chat.customerEmail;
        }
      }
    }

    // ✅ Mỗi lần có tin nhắn mới từ khách → luôn kích hoạt lại cuộc trò chuyện
    chat.active = true;

    // 4. Lưu tin nhắn User
    chat.messages.push({ sender: "user", content });
    chat.lastActivity = new Date();
    await chat.save();

    // Populate tên user để trả về cho FE
    await chat.populate("user", "name email");
    const plainChatAfterUser = chat.toObject();

    // 5. Kiểm tra Human Mode
    if (chat.needsHuman) {
      // Đang có admin/staff xử lý → AI tạm im
      return { chat: plainChatAfterUser, response: null, mode: "human" };
    }

    // 6. Gọi Gemini AI
    try {
      const contextData = await this.findContextData(content, userId);

      // Nếu không có ngữ cảnh → tránh bịa
      if (!contextData || contextData.trim() === "") {
        const fallbackText =
          "Dạ em chưa có thông tin về vấn đề này, để em chuyển sang nhân viên hỗ trợ ạ.";

        chat.messages.push({ sender: "ai", content: fallbackText });
        chat.lastActivity = new Date();
        await chat.save();
        await chat.populate("user", "name email");
        const plainChatAfterAI = chat.toObject();

        return {
          chat: plainChatAfterAI,
          response: fallbackText,
          mode: "no_context",
        };
      }

      const finalPrompt = `
        Bạn là Trợ lý ảo AI của UTH Store (chuyên bán UTH Gaming, Laptop).

        [NGUYÊN TẮC QUAN TRỌNG]:
        - Trả lời ngắn gọn, thân thiện, xưng hô "em" và gọi khách là "anh/chị".
        - CHỈ trả lời dựa trên thông tin được cung cấp bên dưới.
        - Nếu không có thông tin trong dữ liệu, hãy nói: "Dạ em chưa có thông tin về vấn đề này, để em chuyển sang nhân viên hỗ trợ ạ."
        - TUYỆT ĐỐI KHÔNG tự bịa giá hay thông tin sản phẩm.
        [NGỮ CẢNH HỆ THỐNG]:
        ${contextData}

        [CÂU HỎI CỦA KHÁCH]:
        "${content}"
      `;

      const result = await model.generateContent(finalPrompt);
      const aiResponse = result.response.text();

      chat.messages.push({ sender: "ai", content: aiResponse });
      chat.lastActivity = new Date();
      await chat.save();
      await chat.populate("user", "name email");
      const plainChatAfterAI = chat.toObject();

      return { chat: plainChatAfterAI, response: aiResponse, mode: "ai" };
    } catch (error) {
      console.error("Gemini Error:", error);

      const fallbackText = "Hệ thống đang bận, bạn chờ em xíu nhé.";

      chat.messages.push({ sender: "ai", content: fallbackText });
      chat.lastActivity = new Date();
      await chat.save();
      await chat.populate("user", "name email");
      const plainChatAfterError = chat.toObject();

      return {
        chat: plainChatAfterError,
        response: fallbackText,
        mode: "error",
      };
    }
  }

  /**
   * Xử lý tin nhắn từ Admin
   */
  static async handleAdminMessage({ sessionId, content }) {
    const chat = await Chat.findOne({ sessionId });
    if (!chat) throw new Error("Session not found");

    chat.messages.push({ sender: "admin", content });
    chat.lastActivity = new Date();

    await chat.save();
    await chat.populate("user", "name email");
    return chat.toObject();
  }

  /**
   * Lấy lịch sử chat (API load lần đầu cho widget)
   */
  static async getHistory(sessionId) {
    return await Chat.findOne({ sessionId }).populate("user", "name email");
  }

  /**
   * Admin: Lấy danh sách các đoạn chat đang active
   */
  static async getAllActiveChats() {
    return await Chat.find({ active: true })
      .populate("user", "name email")
      .sort({ lastActivity: -1 });
  }

  /**
   * Admin: Ẩn (xóa khỏi dashboard) một cuộc trò chuyện
   * - KHÔNG xóa khỏi DB
   * - Customer vẫn thấy lịch sử qua /history/:sessionId
   */
  static async archiveChat(sessionId) {
    const chat = await Chat.findOneAndUpdate(
      { sessionId },
      { active: false, lastActivity: new Date() },
      { new: true }
    )
      .populate("user", "name email")
      .lean();

    return chat; // có thể null nếu không tìm thấy
  }
}
