// backend/scripts/debug-categories.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function debugCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const { Category } = await import("../src/models/category.model.js");
    const { Product } = await import("../src/models/product.model.js");

    // 1. Check categories
    console.log("📋 CATEGORIES:");
    console.log("=".repeat(60));
    const categories = await Category.find().sort("order");

    if (categories.length === 0) {
      console.log("❌ KHÔNG CÓ CATEGORY NÀO!");
      console.log("💡 Chạy: node scripts/seed-categories.js");
    } else {
      categories.forEach((cat, i) => {
        console.log(`${i + 1}. ${cat.name} (slug: ${cat.slug})`);
        console.log(`   Status: ${cat.status}`);
        console.log(`   Order: ${cat.order}`);
      });
    }

    console.log("\n📦 PRODUCTS BY CATEGORY:");
    console.log("=".repeat(60));

    // 2. Check products theo từng category
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat.slug });
      console.log(`${cat.slug}: ${count} sản phẩm`);

      if (count > 0) {
        const samples = await Product.find({ category: cat.slug })
          .limit(3)
          .select("title category");
        samples.forEach((p) => {
          console.log(`  - ${p.title} (category: "${p.category}")`);
        });
      }
    }

    // 3. Check products có category "pc" hoặc "storage"
    console.log("\n🔍 CHECK SPECIFIC CATEGORIES:");
    console.log("=".repeat(60));

    const pcCount = await Product.countDocuments({ category: "pc" });
    const storageCount = await Product.countDocuments({ category: "storage" });

    console.log(`PC: ${pcCount} sản phẩm`);
    console.log(`Storage: ${storageCount} sản phẩm`);

    if (pcCount === 0) {
      console.log("\n⚠️  KHÔNG CÓ SẢN PHẨM PC!");
      console.log("Các category hiện có:");
      const distinctCategories = await Product.distinct("category");
      console.log(distinctCategories);
    }

    if (storageCount === 0) {
      console.log("\n⚠️  KHÔNG CÓ SẢN PHẨM STORAGE!");
    }

    await mongoose.disconnect();
    console.log("\n👋 Disconnected");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

debugCategories();
