// backend/scripts/reset-admin-password.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const { User } = await import("../src/models/user.model.js");

    // Tìm admin
    const admin = await User.findOne({ email: "admin@uthstore.dev" }).select(
      "+password"
    );

    if (!admin) {
      console.log("❌ Admin not found!");
      process.exit(1);
    }

    // Đặt lại password
    admin.password = "Admin@123456"; // Password mới
    await admin.save();

    console.log("✅ Password reset successfully!");
    console.log("\n📋 NEW CREDENTIALS:");
    console.log("=".repeat(50));
    console.log("Email: admin@example.com");
    console.log("Password: Admin@123");
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("\n👋 Disconnected");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetAdminPassword();
