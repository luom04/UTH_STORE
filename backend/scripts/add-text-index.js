// scripts/add-text-index.js
// Chạy file này 1 lần để thêm text index vào MongoDB

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ✅ Load .env từ backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../.env");

console.log("📁 Đường dẫn .env file:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Không thể load .env file:", result.error);
  process.exit(1);
}

console.log("✅ Đã load .env file thành công");
console.log(
  "🔍 MONGODB_URI từ .env:",
  process.env.MONGODB_URI ? "Có" : "KHÔNG CÓ"
);

// ✅ Dynamic import Product model
async function addTextIndex() {
  try {
    // Check MongoDB URI
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI không tồn tại trong .env");
      console.log("💡 Vui lòng thêm MONGODB_URI vào file backend/.env");
      console.log("Ví dụ: MONGODB_URI=mongodb://localhost:27017/uth_store");
      process.exit(1);
    }

    console.log("🔗 Đang kết nối đến MongoDB...");
    // Hide password in log
    const safeUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
    console.log("📍 URI:", safeUri);

    await mongoose.connect(mongoUri);
    console.log("✅ Đã kết nối MongoDB thành công!");

    // Import Product model
    const { Product } = await import("../src/models/product.model.js");

    // ✅ Drop old text indexes (giữ lại các index khác)
    try {
      const indexes = await Product.collection.indexes();
      for (const index of indexes) {
        if (index.name && index.name.includes("text")) {
          await Product.collection.dropIndex(index.name);
          console.log(`🗑️ Đã xóa text index cũ: ${index.name}`);
        }
      }
    } catch (e) {
      console.log("⚠️ Không có text index cũ để xóa");
    }

    // ✅ Tạo text index với trọng số (weight)
    await Product.collection.createIndex(
      {
        title: "text",
        category: "text",
        brand: "text",
        slug: "text",
        description: "text",
      },
      {
        name: "product_text_search",
        weights: {
          title: 10, // Title match → điểm cao nhất
          category: 5, // Category match → điểm trung bình
          brand: 5, // Brand match → điểm trung bình
          slug: 3, // Slug match → điểm thấp
          description: 1, // Description match → điểm thấp nhất
        },
        default_language: "none", // Không stemming (giữ nguyên từ)
      }
    );

    console.log("✅ Đã tạo text index thành công!");
    console.log("\n📊 Chi tiết index:");
    const allIndexes = await Product.collection.indexes();
    allIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key);
      if (idx.weights) {
        console.log(`    Weights:`, idx.weights);
      }
    });

    await mongoose.disconnect();
    console.log("\n👋 Đã ngắt kết nối MongoDB");
    console.log("🎉 Hoàn thành! Bây giờ search sẽ ưu tiên theo độ liên quan.");
  } catch (error) {
    console.error("\n❌ Lỗi:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Giải pháp:");
      console.log("1. Kiểm tra MongoDB đã chạy chưa:");
      console.log("   - Windows: Mở Services → tìm MongoDB");
      console.log("   - Mac/Linux: sudo systemctl status mongod");
      console.log("\n2. Hoặc check MONGODB_URI trong .env có đúng không");
      console.log("\n3. File .env hiện tại:", envPath);
    }

    process.exit(1);
  }
}

addTextIndex();
