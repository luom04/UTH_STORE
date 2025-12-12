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

// 💡 Helper: phân loại intent câu hỏi để tối ưu truy vấn
function detectIntent(rawQuery = "") {
  const q = rawQuery.toLowerCase();

  // Hỏi theo mã đơn hàng
  if (/ord\d+/i.test(rawQuery)) return "order";

  const productKeywords = [
    "laptop",
    "pc",
    "máy tính",
    "card",
    "rtx",
    "gtx",
    "core i3",
    "core i5",
    "core i7",
    "ultra",
    "ssd",
    "ram",
  ];

  const faqKeywords = [
    "bảo hành",
    "đổi trả",
    "thanh toán",
    "ship",
    "giao hàng",
    "vận chuyển",
    "trả góp",
    "chính sách",
    "giờ mở cửa",
  ];

  const hasProduct = productKeywords.some((k) => q.includes(k));
  const hasFaq = faqKeywords.some((k) => q.includes(k));

  if (hasProduct && !hasFaq) return "product";
  if (hasFaq && !hasProduct) return "faq";
  if (hasProduct && hasFaq) return "mixed";

  // Không rõ → cho là mixed để vẫn lấy nhẹ nhàng
  return "mixed";
}

export class ChatService {
  /**
   * 🧠 RAG CORE: Tìm dữ liệu liên quan trong DB
   * - Sản phẩm
   * - Đơn hàng
   * - FAQ nội bộ (Câu hỏi thường gặp)
   */
  static async findContextData(query, userId) {
    if (!query || !query.trim()) return "";

    const intent = detectIntent(query);
    let contextText = "";

    // Chuẩn bị biến chứa kết quả
    let productResults = [];
    let faqResults = [];
    let orderInfo = null;

    // ===============================
    // 0) CHUẨN BỊ TASK CHẠY SONG SONG
    // ===============================
    const tasks = [];

    // ---------- 1) PRODUCT ----------
    if (intent === "product" || intent === "mixed") {
      tasks.push(
        (async () => {
          try {
            // ƯU TIÊN: TEXT SEARCH
            let results = await Product.find(
              {
                $text: { $search: query },
                status: "active",
              },
              {
                score: { $meta: "textScore" },
              }
            )
              .sort({ score: { $meta: "textScore" } })
              .select(
                "title price priceSale stock slug shortDescription description"
              )
              .limit(3)
              .lean();

            // FALLBACK: regex trên title nếu text search không ra gì
            if (!results || results.length === 0) {
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

              const topWords = keyWords.slice(0, 5);

              const regexes = topWords.map((w) => {
                const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                return new RegExp(escaped, "i");
              });

              if (regexes.length > 0) {
                const orConds = regexes.map((re) => ({ title: re }));
                results = await Product.find({
                  $or: orConds,
                  status: "active",
                })
                  .select(
                    "title price priceSale stock slug shortDescription description"
                  )
                  .limit(3)
                  .lean();
              }
            }

            productResults = results || [];
          } catch (err) {
            console.error("[ChatService] Product search error:", err.message);
          }
        })()
      );
    }

    // ---------- 2) ORDER ----------
    // Chỉ tìm đơn nếu câu hỏi có mã ORDxxx *và* có userId (tránh lộ đơn người khác)
    const orderMatch = query.match(/ORD\d+/i);
    if (orderMatch && userId) {
      tasks.push(
        (async () => {
          try {
            const orderCode = orderMatch[0].toUpperCase();
            const order = await Order.findOne({
              orderNumber: orderCode,
              user: userId, // 🔒 chỉ lấy đơn của đúng khách
            })
              .select("status grandTotal paymentStatus")
              .lean();

            if (order) {
              orderInfo = {
                code: orderCode,
                status: order.status,
                paymentStatus: order.paymentStatus,
                grandTotal: order.grandTotal,
              };
            }
          } catch (err) {
            console.error("[ChatService] Order lookup error:", err.message);
          }
        })()
      );
    }

    // ---------- 3) FAQ ----------
    // FAQ thường dùng cho intent faq / order / mixed
    if (["faq", "order", "mixed"].includes(intent)) {
      tasks.push(
        (async () => {
          try {
            const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

            const results = await Faq.find({
              isActive: true,
              $or: [
                { question: { $regex: query, $options: "i" } },
                { keywords: { $in: tokens } },
              ],
            })
              .select("question answer")
              .limit(3) // 3 câu là đủ, tránh text dài
              .lean();

            faqResults = results || [];
          } catch (err) {
            console.error("[ChatService] FAQ lookup error:", err.message);
          }
        })()
      );
    }

    // ===============================
    // 4) ĐỢI TẤT CẢ TASK XONG
    // ===============================
    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    // ===============================
    // 5) BUILD CONTEXT GỌN NHẤT CÓ THỂ
    // ===============================

    // 5.1. SẢN PHẨM
    if (productResults.length > 0) {
      contextText += "\n[DỮ LIỆU KHO HÀNG]:\n";

      productResults.forEach((p) => {
        const rawPrice = p.priceSale > 0 ? p.priceSale : p.price;
        const price =
          typeof rawPrice === "number"
            ? rawPrice.toLocaleString("vi-VN")
            : rawPrice;
        const stockStatus = p.stock > 0 ? "Còn hàng" : "Hết hàng";

        const desc =
          (p.shortDescription || p.description || "")
            .toString()
            .slice(0, 160) // cắt ngắn hơn để tiết kiệm token
            .trim() || "";

        contextText += `- Sản phẩm: ${p.title}
  Giá tham khảo: ${price} VND
  Tình trạng: ${stockStatus}
  Mô tả ngắn: ${desc}
`;
      });
    }

    // 5.2. ĐƠN HÀNG
    if (orderInfo) {
      const total =
        typeof orderInfo.grandTotal === "number"
          ? orderInfo.grandTotal.toLocaleString("vi-VN")
          : orderInfo.grandTotal;

      contextText += `\n[THÔNG TIN ĐƠN HÀNG ${orderInfo.code}]:\n`;
      contextText += `- Trạng thái: ${orderInfo.status}\n`;
      contextText += `- Thanh toán: ${orderInfo.paymentStatus}\n`;
      contextText += `- Tổng tiền: ${total} VND\n`;
    }

    // 5.3. FAQ
    if (faqResults.length > 0) {
      contextText += "\n[CÂU HỎI THƯỜNG GẶP]:\n";
      faqResults.forEach((f, idx) => {
        const answerShort = f.answer.toString().slice(0, 220).trim(); // cắt bớt cho ngắn
        contextText += `Q${idx + 1}: ${f.question}\nA${
          idx + 1
        }: ${answerShort}\n`;
      });
    }

    return contextText.trim();
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
