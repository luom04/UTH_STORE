import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Định nghĩa các variants cho animation
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
};

export default function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const loginPromise = fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ Browser tự động gửi httpOnly cookie
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
      }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Thông tin đăng nhập không chính xác");
      }
      return data;
    });

    toast
      .promise(loginPromise, {
        loading: "Đang đăng nhập...",
        success: (data) => {
          // Server đã set httpOnly cookie, không cần lưu token
          console.log("Login successful:", data);

          // Chỉ lưu remember email nếu người dùng chọn
          if (form.remember) {
            localStorage.setItem("remember_email", form.email);
          }

          setTimeout(() => navigate("/"), 1000);
          return "Đăng nhập thành công!";
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

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

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
            Welcome Back!
          </h1>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={onChange}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>

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
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Hiển thị lỗi dưới form */}
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
              onClick={loginWithGoogle}
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

          {/* Link tới trang Register */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
