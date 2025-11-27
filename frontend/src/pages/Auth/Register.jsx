// src/pages/Auth/Register.jsx
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  LoaderCircle,
  Check,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRegister } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
};

// Kiểm tra độ mạnh của mật khẩu
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, text: "", color: "" },
    { score: 1, text: "Yếu", color: "text-red-600" },
    { score: 2, text: "Yếu", color: "text-red-600" },
    { score: 3, text: "Trung bình", color: "text-yellow-600" },
    { score: 4, text: "Khỏe", color: "text-blue-600" },
    { score: 5, text: "Rất khỏe", color: "text-green-600" },
    { score: 6, text: "Rất khỏe", color: "text-green-600" },
  ];

  return levels[score];
};

// Validation functions
const validateFullName = (fullName) => {
  if (!fullName.trim()) {
    return "Vui lòng nhập họ tên";
  }
  if (fullName.trim().length < 2) {
    return "Họ tên phải có ít nhất 2 ký tự";
  }
  if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName.trim())) {
    return "Họ tên chỉ được chứa chữ cái và khoảng trắng";
  }
  return "";
};

const validateEmail = (email) => {
  if (!email.trim()) {
    return "Vui lòng nhập email";
  }

  // Regex cải tiến: yêu cầu ít nhất 2 ký tự sau dấu chấm
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return "Email không hợp lệ. Ví dụ: example@gmail.com";
  }

  return "";
};

const validatePassword = (password) => {
  if (!password) {
    return "Vui lòng nhập mật khẩu";
  }
  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ thường";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ hoa";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ số";
  }
  return "";
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Vui lòng xác nhận mật khẩu";
  }
  if (password !== confirmPassword) {
    return "Mật khẩu không khớp";
  }
  return "";
};

const validateTerms = (agreeTerms) => {
  if (!agreeTerms) {
    return "Vui lòng đồng ý với điều khoản sử dụng";
  }
  return "";
};

export default function Register() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
  });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // ✅ Sử dụng React Query hook
  const { mutate: register, isPending, error } = useRegister();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((f) => ({ ...f, [name]: newValue }));

    // Clear error khi user nhập
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        return validateFullName(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(form.password, value);
      case "agreeTerms":
        return validateTerms(value);
      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {
      fullName: validateFullName(form.fullName),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(
        form.password,
        form.confirmPassword
      ),
      agreeTerms: validateTerms(form.agreeTerms),
    };

    setFieldErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(
      name,
      name === "agreeTerms" ? form.agreeTerms : value
    );
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ✅ Gọi mutation
    register({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
    });
  };

  const registerWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE}/auth/google`;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const hasFieldErrors = Object.values(fieldErrors).some(
    (error) => error !== ""
  );
  const displayError = hasFieldErrors
    ? "Vui lòng kiểm tra lại thông tin đã nhập"
    : error?.message;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 grid place-items-center px-4 py-8">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] rounded-2xl bg-white shadow-xl border border-gray-100"
      >
        <div className="px-6 pb-6 pt-8 sm:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Create Account
          </h1>

          <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
            {/* Input Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  disabled={isPending}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 outline-none transition-colors focus:ring-1 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    fieldErrors.fullName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <AnimatePresence>
                {fieldErrors.fullName && (
                  <motion.p
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {fieldErrors.fullName}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  disabled={isPending}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 outline-none transition-colors focus:ring-1 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    fieldErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              <AnimatePresence>
                {fieldErrors.email && (
                  <motion.p
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {fieldErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  disabled={isPending}
                  className={`w-full rounded-lg border pl-10 pr-10 py-2.5 outline-none transition-colors focus:ring-1 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength.score
                            ? passwordStrength.color.replace("text-", "bg-")
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.text && (
                    <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                      Độ mạnh: {passwordStrength.text}
                    </p>
                  )}
                </div>
              )}
              <AnimatePresence>
                {fieldErrors.password && (
                  <motion.p
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {fieldErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Input Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  name="confirmPassword"
                  type={showConfirmPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  disabled={isPending}
                  className={`w-full rounded-lg border pl-10 pr-10 py-2.5 outline-none transition-colors focus:ring-1 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((s) => !s)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  aria-label="Toggle confirm password"
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirmPassword &&
                form.password === form.confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check size={14} /> Mật khẩu khớp
                  </p>
                )}
              <AnimatePresence>
                {fieldErrors.confirmPassword && (
                  <motion.p
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {fieldErrors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={isPending}
                  className={`size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed ${
                    fieldErrors.agreeTerms ? "border-red-500" : ""
                  }`}
                />
                <span className="text-sm text-gray-600">
                  I agree with{" "}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Terms of Use
                  </a>
                </span>
              </label>
              <AnimatePresence>
                {fieldErrors.agreeTerms && (
                  <motion.p
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {fieldErrors.agreeTerms}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Nút Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPending}
              className="w-full h-11 flex items-center justify-center rounded-lg py-2.5 font-semibold text-white transition-all duration-300
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isPending ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <LoaderCircle size={20} className="animate-spin" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    Sign Up
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Hiển thị lỗi tổng */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="text-sm text-red-600 text-center bg-red-50 py-2 px-3 rounded-lg border border-red-200"
                >
                  {displayError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs uppercase text-gray-500 whitespace-nowrap">
                Or continue with
              </span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* Nút Google */}
            <button
              type="button"
              onClick={registerWithGoogle}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Google
            </button>
          </form>

          {/* Link tới trang Login */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to={PATHS.LOGIN}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
