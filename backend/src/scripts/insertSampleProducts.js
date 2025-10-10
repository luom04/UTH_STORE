// src/scripts/insertSampleProducts.js
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import { Product } from "../models/product.model.js";
import { toSlug } from "../utils/slugify.js";

const log = (...a) => console.log("[sample]", ...a);

const SAMPLE_PRODUCTS = [
  {
    title: "Laptop Gaming RTX 4060",
    price: 25990000,
    stock: 12,
    category: "laptop",
    brand: "ASUS",
    images: ["https://picsum.photos/seed/uth-4060/800/600"],
    description: "Laptop gaming cấu hình mạnh, RTX 4060.",
    isFeatured: true,
    status: "active",
  },
  {
    title: "Chuột Gaming 8KHz",
    price: 1290000,
    stock: 50,
    category: "mouse",
    brand: "Razer",
    images: ["https://picsum.photos/seed/uth-mouse/800/600"],
    description: "Chuột gaming polling 8KHz, cảm biến quang học.",
    status: "active",
  },
  {
    title: "Bàn phím cơ TKL Switch Tactile",
    price: 1890000,
    stock: 30,
    category: "keyboard",
    brand: "Keychron",
    images: ["https://picsum.photos/seed/uth-keyboard/800/600"],
    description: "Bàn phím cơ TKL, hot-swap, keycap PBT.",
    status: "active",
  },
  {
    title: 'Màn hình 27" QHD 165Hz',
    price: 5990000,
    stock: 20,
    category: "monitor",
    brand: "AOC",
    images: ["https://picsum.photos/seed/uth-monitor/800/600"],
    description: "IPS 27 inch, 2560x1440, 165Hz.",
    status: "active",
  },
  {
    title: "Tai nghe Gaming 7.1",
    price: 990000,
    stock: 40,
    category: "headset",
    brand: "HyperX",
    images: ["https://picsum.photos/seed/uth-headset/800/600"],
    description: "Âm thanh giả lập 7.1, micro khử ồn.",
    status: "active",
  },
];

async function run() {
  await connectDB();

  // Tạo mảng upsert theo slug
  const ops = SAMPLE_PRODUCTS.map((p) => {
    const slug = toSlug(p.title);
    return {
      updateOne: {
        filter: { slug },
        update: { $set: { ...p, slug } },
        upsert: true,
      },
    };
  });

  const res = await Product.bulkWrite(ops, { ordered: false });

  log("Upserted:", res.upsertedCount || 0);
  log("Modified:", res.modifiedCount || 0);
  log("Matched :", res.matchedCount || 0);

  const count = await Product.countDocuments();
  log("Total products in DB:", count);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (e) => {
  console.error("❌ Insert sample error:", e);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
