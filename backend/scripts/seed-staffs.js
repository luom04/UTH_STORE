// backend/scripts/seed-staffs.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function seedStaffs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const { User } = await import("../src/models/user.model.js");
    const { ROLES } = await import("../src/constants/roles.js");

    // Xóa tất cả admin và staff cũ
    await User.deleteMany({ role: { $in: [ROLES.ADMIN, ROLES.STAFF] } });
    console.log("🗑️  Cleared existing admin/staff users\n");

    // Tạo 1 Admin + 3 Staff
    const users = [
      {
        name: "Nguyễn Văn A",
        email: "staff1@example.com",
        password: "Staff@123",
        role: ROLES.STAFF,
        isEmailVerified: true,
      },
      {
        name: "Trần Thị B",
        email: "staff2@example.com",
        password: "Staff@123",
        role: ROLES.STAFF,
        isEmailVerified: true,
      },
      {
        name: "Lê Văn C",
        email: "staff3@example.com",
        password: "Staff@123",
        role: ROLES.STAFF,
        isEmailVerified: true,
      },
    ];

    const created = await User.create(users);
    console.log(`✅ Created ${created.length} users:\n`);

    created.forEach((u) => {
      console.log(`  - ${u.role.toUpperCase()}: ${u.email} (${u.name})`);
    });

    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("=".repeat(50));
    console.log("Admin:");
    console.log("  Email: admin@example.com");
    console.log("  Password: Admin@123");
    console.log("\nStaff:");
    console.log("  Email: staff1@example.com");
    console.log("  Password: Staff@123");
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedStaffs();
