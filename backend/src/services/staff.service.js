// backend/src/services/staff.service.js
import { User } from "../models/user.model.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";

export class StaffService {
  /**
   * Lấy danh sách nhân viên
   */
  static async getStaffs({ page = 1, limit = 20, q = "" }) {
    const skip = (page - 1) * limit;

    const filter = {
      role: { $in: [ROLES.ADMIN, ROLES.STAFF] },
    };

    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select("name email role isEmailVerified salary createdAt updatedAt") // ✅ Add salary
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      data: items.map((u) => ({
        id: u._id.toString(),
        name: u.name || "",
        email: u.email,
        role: u.role,
        active: u.isEmailVerified,
        salary: u.salary || 0, // ✅ Add salary
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tạo nhân viên mới
   */
  static async createStaff({
    name,
    email,
    password,
    role = ROLES.STAFF,
    salary = 0,
  }) {
    const allowedRoles = [ROLES.ADMIN, ROLES.STAFF];
    if (!allowedRoles.includes(role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Email already exists");
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      salary: Number(salary) || 0, // ✅ Add salary
      isEmailVerified: true,
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      salary: user.salary, // ✅ Add salary
      active: user.isEmailVerified,
    };
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  static async updateStaff(staffId, updates) {
    const staff = await User.findById(staffId);
    if (!staff) {
      throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
    }

    if (updates.role) {
      const allowedRoles = [ROLES.ADMIN, ROLES.STAFF];
      if (!allowedRoles.includes(updates.role)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role");
      }
      staff.role = updates.role;
    }

    if (updates.name !== undefined) {
      staff.name = updates.name;
    }

    // ✅ Update salary
    if (updates.salary !== undefined) {
      staff.salary = Number(updates.salary) || 0;
    }

    await staff.save();

    return {
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      role: staff.role,
      salary: staff.salary, // ✅ Add salary
      active: staff.isEmailVerified,
    };
  }

  /**
   * Kích hoạt / Vô hiệu hóa nhân viên
   */
  static async toggleActive(staffId, active) {
    const staff = await User.findById(staffId);
    if (!staff) {
      throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
    }

    staff.isEmailVerified = active;
    await staff.save();

    return {
      id: staff._id.toString(),
      active: staff.isEmailVerified,
    };
  }

  // backend/src/services/staff.service.js
  // ✅ SỬA FUNCTION deleteStaff():

  /**
   * Xóa nhân viên (HARD DELETE - xóa hẳn khỏi DB)
   */
  static async deleteStaff(staffId) {
    const staff = await User.findById(staffId);
    if (!staff) {
      throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
    }

    // Không cho xóa admin cuối cùng
    if (staff.role === ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: ROLES.ADMIN });
      if (adminCount <= 1) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cannot delete the last admin"
        );
      }
    }

    // ✅ HARD DELETE: Xóa hẳn khỏi database
    await User.findByIdAndDelete(staffId);

    return { message: "Staff deleted successfully" };
  }
}
