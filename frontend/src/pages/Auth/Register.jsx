import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  LoaderCircle,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

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

export default function Register() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setErr("Vui lòng nhập họ tên");
      return false;
    }
    if (!form.email.trim()) {
      setErr("Vui lòng nhập email");
      return false;
    }
    if (form.password.length < 8) {
      setErr("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setErr("Mật khẩu không khớp");
      return false;
    }
    if (!form.agreeTerms) {
      setErr("Vui lòng đồng ý với điều khoản sử dụng");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const registerPromise = fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Đăng ký không thành công");
      }
      return data;
    });

    toast
      .promise(registerPromise, {
        loading: "Đang đăng ký...",
        success: (data) => {
          console.log("Register successful:", data);
          setTimeout(() => navigate("/login"), 1500);
          return "Đăng ký thành công! Đang chuyển hướng...";
        },
        error: (err) => {
          setErr(err.message);
          return err.message;
        },
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const registerWithGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const passwordStrength = getPasswordStrength(form.password);

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

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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
                  required
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
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
                  required
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
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
                  required
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  required
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            </div>

            {/* Terms Checkbox */}
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={onChange}
                className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">
                I agree with{""}
                <a href="#" className="text-indigo-600 hover:underline">
                  Terms of Use
                </a>
              </span>
            </label>

            {/* Nút Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center rounded-lg py-2.5 font-semibold text-white transition-all duration-300
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:bg-indigo-400"
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
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

            {/* Hiển thị lỗi */}
            <AnimatePresence>
              {err && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="text-sm text-red-600 text-center"
                >
                  {err}
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
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
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
            Already have an account ?{""}
            <Link
              to="/login"
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
