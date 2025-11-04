// backend/scripts/seed-categories.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const { Category } = await import("../src/models/category.model.js");

    // Clear existing
    await Category.deleteMany({});
    console.log("🗑️ Cleared existing categories");

    // Seed data (theo productSpecs.js của bạn)
    const categories = [
      {
        name: "PC - Máy tính để bàn",
        slug: "pc",
        description: "PC đồng bộ, PC gaming",
        icon: "Monitor",
        order: 1,
        status: "active",
      },
      {
        name: "Laptop",
        slug: "laptop",
        description: "Laptop gaming, văn phòng, đồ họa",
        icon: "Laptop",
        order: 2,
        status: "active",
      },
      {
        name: "CPU - Bộ vi xử lý",
        slug: "cpu",
        description: "CPU Intel, AMD cho PC",
        icon: "Cpu",
        order: 3,
        status: "active",
      },
      {
        name: "VGA - Card màn hình",
        slug: "vga",
        description: "Card đồ họa NVIDIA, AMD",
        icon: "GpuCard",
        order: 4,
        status: "active",
      },
      {
        name: "Mainboard - Bo mạch chủ",
        slug: "mainboard",
        description: "Bo mạch chủ Intel, AMD",
        icon: "CircuitBoard",
        order: 5,
        status: "active",
      },
      {
        name: "RAM - Bộ nhớ",
        slug: "ram",
        description: "RAM DDR4, DDR5",
        icon: "MemoryStick",
        order: 6,
        status: "active",
      },
      {
        name: "Storage - Ổ cứng",
        slug: "storage",
        description: "SSD, HDD",
        icon: "HardDrive",
        order: 7,
        status: "active",
      },
      {
        name: "PSU - Nguồn máy tính",
        slug: "psu",
        description: "Nguồn máy tính",
        icon: "Power",
        order: 8,
        status: "active",
      },
      {
        name: "Case - Vỏ máy tính",
        slug: "case",
        description: "Vỏ case máy tính",
        icon: "Box",
        order: 9,
        status: "active",
      },
      {
        name: "Cooling - Tản nhiệt",
        slug: "cooling",
        description: "Tản nhiệt khí, nước",
        icon: "Fan",
        order: 10,
        status: "active",
      },
      {
        name: "Monitor - Màn hình",
        slug: "monitor",
        description: "Màn hình máy tính",
        icon: "Monitor",
        order: 11,
        status: "active",
      },
      {
        name: "Keyboard - Bàn phím",
        slug: "keyboard",
        description: "Bàn phím cơ, gaming",
        icon: "Keyboard",
        order: 12,
        status: "active",
      },
      {
        name: "Mouse - Chuột",
        slug: "mouse",
        description: "Chuột gaming, văn phòng",
        icon: "Mouse",
        order: 13,
        status: "active",
      },
    ];

    const result = await Category.insertMany(categories);
    console.log(`✅ Seeded ${result.length} categories`);

    // In ra danh sách
    console.log("\n📋 Categories:");
    result.forEach((cat) => {
      console.log(`  ${cat.order}. ${cat.name} (${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedCategories();
