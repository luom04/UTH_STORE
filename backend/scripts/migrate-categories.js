// backend/scripts/migrate-categories.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function migrateCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const { Product } = await import("../src/models/product.model.js");

    // ============================================
    // MIGRATION RULES
    // ============================================
    const migrations = [
      // SSD → storage
      {
        old: "ssd",
        new: "storage",
        description: "SSD → Storage",
      },
      // HDD → storage
      {
        old: "hdd",
        new: "storage",
        description: "HDD → Storage",
      },
      // pc-build → pc
      {
        old: "pc-build",
        new: "pc",
        description: "PC Build → PC",
      },
    ];

    console.log("🔄 MIGRATING CATEGORIES:");
    console.log("=".repeat(60));

    let totalUpdated = 0;

    for (const rule of migrations) {
      const count = await Product.countDocuments({ category: rule.old });

      if (count === 0) {
        console.log(`⚪ ${rule.description}: 0 sản phẩm (bỏ qua)`);
        continue;
      }

      // Update
      const result = await Product.updateMany(
        { category: rule.old },
        { $set: { category: rule.new } }
      );

      console.log(`✅ ${rule.description}: ${result.modifiedCount} sản phẩm`);
      totalUpdated += result.modifiedCount;

      // Show samples
      const samples = await Product.find({ category: rule.new })
        .limit(3)
        .select("title category");
      samples.forEach((p) => {
        console.log(`   - ${p.title}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log(`📊 TỔNG KẾT: Đã cập nhật ${totalUpdated} sản phẩm`);

    // ============================================
    // VERIFY RESULTS
    // ============================================
    console.log("\n📋 VERIFY RESULTS:");
    console.log("=".repeat(60));

    const pcCount = await Product.countDocuments({ category: "pc" });
    const storageCount = await Product.countDocuments({ category: "storage" });
    const ssdCount = await Product.countDocuments({ category: "ssd" });
    const hddCount = await Product.countDocuments({ category: "hdd" });
    const pcBuildCount = await Product.countDocuments({ category: "pc-build" });

    console.log(`✅ PC: ${pcCount} sản phẩm`);
    console.log(`✅ Storage: ${storageCount} sản phẩm`);
    console.log(
      `${ssdCount === 0 ? "✅" : "❌"} SSD (old): ${ssdCount} sản phẩm`
    );
    console.log(
      `${hddCount === 0 ? "✅" : "❌"} HDD (old): ${hddCount} sản phẩm`
    );
    console.log(
      `${
        pcBuildCount === 0 ? "✅" : "❌"
      } PC-Build (old): ${pcBuildCount} sản phẩm`
    );

    // ============================================
    // UPDATE CATEGORY PRODUCT COUNTS
    // ============================================
    console.log("\n🔢 UPDATING CATEGORY COUNTS...");
    const { Category } = await import("../src/models/category.model.js");

    const categories = await Category.find();
    for (const cat of categories) {
      await cat.updateProductCount();
    }
    console.log("✅ Category counts updated!");

    await mongoose.disconnect();
    console.log("\n👋 Disconnected");
    console.log("\n🎉 MIGRATION COMPLETED!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

migrateCategories();
