//src/models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES, ROLES } from "../constants/roles.js";

const AddressSchema = new mongoose.Schema(
  {
    fullname: String,
    phone: String,
    address: String,
    province: { code: String, name: String },
    district: { code: String, name: String },
    ward: { code: String, name: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false }
);

// ✅ [CRM] Schema cho Ghi chú nội bộ
const NoteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người viết note (Admin/Staff)
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // Tự tạo ID cho mỗi note để dễ xóa/sửa sau này
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: ROLE_VALUES, // ['admin','staff','customer']
      default: ROLES.CUSTOMER, // 'customer'
      set: (v) => String(v || ROLES.CUSTOMER).toLowerCase(),
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },

    // 🆕 THÊM FIELD MỚI: Khóa/mở tài khoản
    isActive: {
      type: Boolean,
      default: true, // Mặc định active
    },
    phone: { type: String, trim: true, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    dob: {
      d: { type: String, default: "" },
      m: { type: String, default: "" },
      y: { type: String, default: "" },
    },
    addresses: [AddressSchema],
    notes: [NoteSchema],
    // ✅ THÊM 3 DÒNG NÀY:
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    // ✅ NEW: Lương (chỉ cho staff/admin)
    salary: {
      type: Number,
      default: 0,
      min: 0,
    },
    isStudent: { type: Boolean, default: false },
    // ✅ 2. Thông tin xét duyệt
    studentInfo: {
      studentIdImage: { type: String, default: "" }, // Link ảnh thẻ SV
      schoolName: { type: String, default: "" }, // Tên trường
      status: {
        type: String,
        enum: ["none", "pending", "verified", "rejected"],
        default: "none",
      },
      rejectedReason: { type: String, default: "" }, // Lý do từ chối
      submittedAt: { type: Date }, // Ngày gửi yêu cầu
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  // hash password nếu đổi
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  // luôn lowercase role
  if (this.isModified("role") && typeof this.role === "string") {
    this.role = this.role.toLowerCase();
  }
  // chỉ 1 địa chỉ mặc định
  if (Array.isArray(this.addresses)) {
    let seen = false;
    this.addresses.forEach((a) => {
      if (a.isDefault) {
        if (seen) a.isDefault = false;
        seen = true;
      }
    });
  }
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model("User", UserSchema);
