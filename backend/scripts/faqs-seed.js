// backend/scripts/seed-faqs.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 1. Cấu hình môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

// 2. Dữ liệu FAQ Mới cần thêm
const newFaqData = [
  {
    question:
      "Máy tính để bàn (PC) mua tại UTH Store được bảo hành như thế nào?",
    answer:
      "PC lắp sẵn tại UTH Store được bảo hành theo từng linh kiện, đúng chính sách của nhà sản xuất. Khi có vấn đề, bạn chỉ cần mang máy hoặc linh kiện đến UTH Store, kỹ thuật viên sẽ kiểm tra và hỗ trợ bảo hành theo đúng quy định.",
    keywords: ["bảo hành", "pc", "máy tính bàn", "linh kiện"],
    category: "Bảo hành",
    isActive: true,
  },
  {
    question: "Nếu sản phẩm bị lỗi do nhà sản xuất thì UTH Store xử lý ra sao?",
    answer:
      "Nếu sản phẩm bị lỗi phần cứng do nhà sản xuất trong thời gian bảo hành, UTH Store sẽ hỗ trợ gửi bảo hành hoặc đổi mới theo chính sách từng hãng. Bạn vui lòng giữ đầy đủ hộp, phụ kiện và hóa đơn để được hỗ trợ nhanh hơn.",
    keywords: ["bảo hành", "lỗi", "nhà sản xuất", "đổi mới"],
    category: "Bảo hành",
    isActive: true,
  },
  {
    question: "UTH Store có hỗ trợ bảo hành tận nơi không?",
    answer:
      "Một số sản phẩm như màn hình, laptop, PC có thể được hãng hỗ trợ bảo hành tận nơi tại nhà tuỳ khu vực. Bạn có thể liên hệ UTH Store hoặc tổng đài của hãng để được hướng dẫn chi tiết.",
    keywords: ["bảo hành", "tận nơi", "tại nhà"],
    category: "Bảo hành",
    isActive: true,
  },
  {
    question: "Chính sách đổi trả sản phẩm tại UTH Store như thế nào?",
    answer:
      "UTH Store hỗ trợ đổi sản phẩm trong vòng 7 ngày nếu sản phẩm bị lỗi phần cứng do nhà sản xuất. Trường hợp đổi trả vì lý do cá nhân (không ưng, mua nhầm cấu hình, v.v.) sẽ được xem xét tuỳ tình trạng máy và có thể phát sinh phí. Vui lòng liên hệ nhân viên để được tư vấn cụ thể cho từng trường hợp.",
    keywords: ["đổi trả", "hoàn tiền", "7 ngày", "chính sách"],
    category: "Đổi trả & Hoàn tiền",
    isActive: true,
  },
  {
    question: "Khi nào tôi được hoàn tiền đơn hàng?",
    answer:
      "Bạn sẽ được hoàn tiền nếu đơn hàng bị hủy do hết hàng hoặc lỗi hệ thống thanh toán, hoặc trường hợp đổi trả được UTH Store chấp nhận hoàn tiền theo chính sách. Thời gian hoàn tiền phụ thuộc vào phương thức thanh toán (tiền mặt, chuyển khoản, cổng thanh toán online).",
    keywords: ["hoàn tiền", "hủy đơn", "refund"],
    category: "Đổi trả & Hoàn tiền",
    isActive: true,
  },
  {
    question: "Làm sao để kiểm tra tình trạng đơn hàng của tôi?",
    answer:
      'Bạn có thể kiểm tra đơn hàng bằng cách đăng nhập tài khoản tại UTH Store, vào mục "Đơn hàng của tôi" để xem trạng thái chi tiết. Ngoài ra, nếu bạn có mã đơn dạng ORDxxxx, bạn có thể cung cấp mã này cho nhân viên hoặc nhập vào khung chat để hệ thống hỗ trợ tra cứu.',
    keywords: ["đơn hàng", "tình trạng", "ord", "kiểm tra"],
    category: "Đơn hàng & Vận chuyển",
    isActive: true,
  },
  {
    question: "Ý nghĩa các trạng thái đơn hàng tại UTH Store là gì?",
    answer:
      "Các trạng thái đơn hàng tại UTH Store bao gồm: 'Chờ xác nhận' (đã đặt, đợi kiểm tra), 'Đã xác nhận' (đơn đã được duyệt), 'Đang giao' (hàng đang được vận chuyển), 'Hoàn thành' (giao hàng thành công) và 'Đã hủy' (đơn hàng bị hủy).",
    keywords: [
      "trạng thái",
      "đơn hàng",
      "chờ xác nhận",
      "đang giao",
      "hoàn thành",
      "đã hủy",
    ],
    category: "Đơn hàng & Vận chuyển",
    isActive: true,
  },
  {
    question: "Thời gian giao hàng dự kiến là bao lâu?",
    answer:
      "Đối với khu vực nội thành, thời gian giao hàng thường từ 1–2 ngày làm việc. Các tỉnh/thành khác thời gian giao hàng khoảng 2–5 ngày làm việc tuỳ địa chỉ cụ thể và đơn vị vận chuyển. Thời gian có thể thay đổi trong dịp lễ, Tết hoặc khi có chương trình khuyến mãi lớn.",
    keywords: ["giao hàng", "bao lâu", "thời gian", "ship"],
    category: "Đơn hàng & Vận chuyển",
    isActive: true,
  },
  {
    question: "UTH Store có hỗ trợ giao hàng toàn quốc không?",
    answer:
      "UTH Store hỗ trợ giao hàng toàn quốc thông qua các đối tác vận chuyển. Chi phí và thời gian giao hàng sẽ phụ thuộc vào địa chỉ nhận hàng và trọng lượng đơn hàng.",
    keywords: ["giao hàng", "toàn quốc", "ship cod"],
    category: "Đơn hàng & Vận chuyển",
    isActive: true,
  },
  {
    question: "Tôi có thể thay đổi địa chỉ nhận hàng sau khi đã đặt đơn không?",
    answer:
      "Bạn có thể yêu cầu đổi địa chỉ nhận hàng khi đơn vẫn đang ở trạng thái 'Chờ xác nhận' hoặc 'Đã xác nhận'. Khi đơn đã chuyển sang 'Đang giao', việc thay đổi địa chỉ sẽ phụ thuộc vào đơn vị vận chuyển và có thể phát sinh thêm thời gian xử lý.",
    keywords: ["đổi địa chỉ", "đơn hàng", "nhận hàng"],
    category: "Đơn hàng & Vận chuyển",
    isActive: true,
  },
  {
    question: "Tôi có thể hủy đơn hàng đã đặt không?",
    answer:
      "Bạn có thể yêu cầu hủy đơn khi đơn đang ở trạng thái 'Chờ xác nhận' hoặc 'Đã xác nhận'. Nếu đơn đã ở trạng thái 'Đang giao', việc hủy sẽ cần trao đổi lại với UTH Store để xem xét từng trường hợp cụ thể.",
    keywords: ["hủy đơn", "cancel", "đơn hàng"],
    category: "Đơn hàng & Vận chuyển",
    isActive: true,
  },
  {
    question: "UTH Store hỗ trợ những hình thức thanh toán nào?",
    answer:
      "UTH Store hỗ trợ thanh toán bằng tiền mặt tại cửa hàng, chuyển khoản ngân hàng, thanh toán khi nhận hàng (COD) và một số cổng thanh toán online. Thông tin chi tiết sẽ hiển thị trong bước chọn phương thức thanh toán khi đặt hàng.",
    keywords: ["thanh toán", "cod", "chuyển khoản", "online"],
    category: "Thanh toán & Trả góp",
    isActive: true,
  },
  {
    question: "Tôi có thể mua trả góp laptop/PC tại UTH Store không?",
    answer:
      "UTH Store có hỗ trợ trả góp cho một số sản phẩm thông qua đối tác tài chính hoặc thẻ tín dụng. Điều kiện và lãi suất trả góp sẽ tuỳ theo chương trình tại thời điểm mua hàng. Bạn có thể liên hệ nhân viên tư vấn để được hỗ trợ cụ thể.",
    keywords: ["trả góp", "mua trả góp", "laptop", "pc"],
    category: "Thanh toán & Trả góp",
    isActive: true,
  },
  {
    question: "Khi thanh toán online bị lỗi nhưng tiền đã trừ thì sao?",
    answer:
      "Nếu thanh toán online bị lỗi nhưng bạn đã bị trừ tiền, vui lòng liên hệ ngay với UTH Store và cung cấp thông tin giao dịch (mã giao dịch, ngân hàng, thời gian) để được kiểm tra. Nếu giao dịch không thành công, tiền sẽ được ngân hàng hoàn lại theo quy trình của từng ngân hàng.",
    keywords: ["thanh toán", "online", "lỗi", "bị trừ tiền", "hoàn tiền"],
    category: "Thanh toán & Trả góp",
    isActive: true,
  },
  {
    question: "UTH Store có build PC theo yêu cầu không?",
    answer:
      "UTH Store có hỗ trợ tư vấn và build PC theo nhu cầu sử dụng của bạn (gaming, làm việc, đồ họa, học tập, v.v.). Bạn chỉ cần cung cấp ngân sách và mục đích sử dụng, đội ngũ tư vấn sẽ gợi ý cấu hình phù hợp.",
    keywords: ["build pc", "lắp pc", "tư vấn cấu hình"],
    category: "Sản phẩm & Tư vấn",
    isActive: true,
  },
  {
    question:
      "Làm sao biết laptop có phù hợp với nhu cầu chơi game của tôi không?",
    answer:
      "Bạn có thể mô tả tựa game hay dùng (ví dụ: LOL, Valorant, GTA V, v.v.) và ngân sách, UTH Store sẽ tư vấn mẫu laptop hoặc PC có cấu hình phù hợp. Ngoài ra, bạn có thể xem phần mô tả và thông số kỹ thuật trên từng sản phẩm để tham khảo.",
    keywords: ["laptop", "chơi game", "tư vấn", "cấu hình"],
    category: "Sản phẩm & Tư vấn",
    isActive: true,
  },
  {
    question: "Sản phẩm tại UTH Store có phải hàng chính hãng không?",
    answer:
      "Tất cả sản phẩm tại UTH Store đều là hàng mới, chính hãng, có đầy đủ hóa đơn và phiếu bảo hành theo quy định của nhà sản xuất.",
    keywords: ["chính hãng", "hàng thật", "bảo hành"],
    category: "Sản phẩm & Tư vấn",
    isActive: true,
  },
  {
    question: "Laptop mua tại UTH Store có được cài Windows bản quyền không?",
    answer:
      "Nhiều mẫu laptop hiện nay đi kèm Windows bản quyền theo máy (thường là Windows 11). Thông tin này sẽ được ghi rõ ở phần mô tả sản phẩm. Nếu sản phẩm chưa có sẵn Windows bản quyền, UTH Store có thể hỗ trợ tư vấn thêm gói bản quyền phù hợp.",
    keywords: ["windows", "bản quyền", "hệ điều hành", "laptop"],
    category: "Sản phẩm & Tư vấn",
    isActive: true,
  },
  {
    question: "Làm sao để sử dụng mã giảm giá (voucher) tại UTH Store?",
    answer:
      "Bạn có thể nhập mã giảm giá ở bước thanh toán. Hệ thống sẽ tự động áp dụng nếu mã còn hiệu lực và đáp ứng điều kiện chương trình (giá trị đơn tối thiểu, danh mục áp dụng, thời gian sử dụng, v.v.).",
    keywords: ["mã giảm giá", "voucher", "khuyến mãi"],
    category: "Khuyến mãi & Voucher",
    isActive: true,
  },
  {
    question: "Tại sao mã giảm giá của tôi không sử dụng được?",
    answer:
      "Mã giảm giá có thể không sử dụng được nếu hết hạn, đã dùng đủ số lần, không áp dụng cho sản phẩm trong giỏ hoặc giá trị đơn hàng chưa đạt mức tối thiểu. Bạn vui lòng kiểm tra lại điều kiện mã hoặc liên hệ UTH Store để được hỗ trợ.",
    keywords: ["mã giảm giá", "voucher", "lỗi", "không áp dụng"],
    category: "Khuyến mãi & Voucher",
    isActive: true,
  },
  {
    question: "Tôi quên mật khẩu tài khoản UTH Store thì phải làm sao?",
    answer:
      "Bạn có thể dùng chức năng 'Quên mật khẩu' tại trang đăng nhập, nhập email đã đăng ký. Hệ thống sẽ gửi email hướng dẫn đặt lại mật khẩu mới. Nếu không nhận được email, hãy kiểm tra hộp thư spam hoặc liên hệ UTH Store để được hỗ trợ.",
    keywords: ["quên mật khẩu", "reset", "tài khoản"],
    category: "Tài khoản & Bảo mật",
    isActive: true,
  },
  {
    question: "Tài khoản của tôi có được bảo mật an toàn không?",
    answer:
      "UTH Store cam kết bảo mật thông tin khách hàng theo chính sách bảo mật đã công bố. Bạn nên sử dụng mật khẩu mạnh, không chia sẻ tài khoản cho người khác và đăng xuất sau khi sử dụng trên máy lạ.",
    keywords: ["bảo mật", "tài khoản", "an toàn"],
    category: "Tài khoản & Bảo mật",
    isActive: true,
  },
  {
    question: "UTH Store có cửa hàng trực tiếp hay chỉ bán online?",
    answer:
      "UTH Store có kênh bán hàng online và có thể có cửa hàng trưng bày tùy từng thời điểm. Bạn có thể xem thông tin địa chỉ, giờ mở cửa và số điện thoại liên hệ trên website chính thức của UTH Store.",
    keywords: ["cửa hàng", "offline", "địa chỉ", "giờ mở cửa"],
    category: "Cửa hàng & Liên hệ",
    isActive: true,
  },
  {
    question: "Làm sao liên hệ với UTH Store khi cần hỗ trợ nhanh?",
    answer:
      "Khi cần hỗ trợ nhanh, bạn có thể chat trực tiếp với nhân viên trên website, gọi vào số hotline hiển thị trên trang chủ hoặc gửi email đến bộ phận chăm sóc khách hàng của UTH Store.",
    keywords: ["liên hệ", "hotline", "hỗ trợ", "chăm sóc khách hàng"],
    category: "Cửa hàng & Liên hệ",
    isActive: true,
  },
];

// 3. Hàm Seed (Thêm mới không xóa cũ)
async function seedFaqs() {
  try {
    // Kết nối
    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is missing in .env file");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Import Model
    const { Faq } = await import("../src/models/faq.model.js");

    // BƯỚC 1: Lấy Order lớn nhất hiện tại
    // (Để khi thêm mới, số thứ tự sẽ tiếp tục tăng chứ không bắt đầu lại từ 0)
    const lastFaq = await Faq.findOne().sort({ order: -1 });
    let currentOrder = lastFaq ? lastFaq.order : 0;
    console.log(`ℹ️  Current max order is: ${currentOrder}`);

    // BƯỚC 2: Lọc dữ liệu để tránh thêm trùng
    // Lấy danh sách câu hỏi đang có trong DB
    const existingQuestions = await Faq.find({}, "question");
    const existingQuestionSet = new Set(
      existingQuestions.map((q) => q.question)
    );

    // Chỉ giữ lại những câu hỏi MỚI (chưa có trong DB)
    const itemsToInsert = [];

    for (const item of newFaqData) {
      if (!existingQuestionSet.has(item.question)) {
        currentOrder++; // Tăng số thứ tự
        itemsToInsert.push({
          ...item,
          order: currentOrder,
        });
      }
    }

    if (itemsToInsert.length === 0) {
      console.log("⚠️  No new FAQs to add (All questions already exist).");
    } else {
      // BƯỚC 3: Insert dữ liệu mới
      const result = await Faq.insertMany(itemsToInsert);
      console.log(`✅ Successfully added ${result.length} NEW FAQs.`);

      // In thử mẫu
      console.log("\n📋 Added Items:");
      result.slice(0, 3).forEach((item) => {
        console.log(`  ${item.order}. [${item.category}] ${item.question}`);
      });
    }

    // Ngắt kết nối
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding FAQs:", error);
    process.exit(1);
  }
}

seedFaqs();
