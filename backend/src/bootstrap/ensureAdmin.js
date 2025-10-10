// src/bootstrap/ensureAdmin.js
import { User } from "../models/user.model.js";

export async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@uthstore.dev";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123456";

  let user = await User.findOne({ email }).select("+password");
  if (!user) {
    user = await User.create({
      email,
      password, // sẽ được hash ở pre('save')
      name: "Admin",
      role: "admin",
      isEmailVerified: true,
    });
    console.log(`✅ Admin created: ${email}`);
  } else {
    // đảm bảo đúng quyền & trạng thái
    let changed = false;
    if (user.role !== "admin") {
      user.role = "admin";
      changed = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      changed = true;
    }
    // nếu muốn reset pass theo ENV mỗi lần khởi động (tuỳ bạn):
    if (process.env.SEED_ADMIN_RESET_PASS === "true") {
      user.password = password; // sẽ hash lại
      changed = true;
    }
    if (changed) {
      await user.save();
    }
    console.log(`✅ Admin ensured: ${email}`);
  }
}
